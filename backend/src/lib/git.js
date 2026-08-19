const { execFile } = require('child_process');
const { PROJECT_DIR } = require('../config');
const store = require('./store');

function run(cmd, args, cwd) {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, { cwd }, (error, stdout, stderr) => {
      if (error) {
        error.stdout = stdout;
        error.stderr = stderr;
        reject(error);
        return;
      }
      resolve({ stdout, stderr });
    });
  });
}

// PROJECT_DIR(백엔드가 가정하는 프로젝트 폴더)에서 시작해 진짜 git 저장소 루트를
// 물어본다. `git rev-parse --show-toplevel`은 cwd에서 위로 올라가며 .git을 찾는
// 실제 git 동작 그대로이므로, 폴더 구조를 하드코딩으로 믿는 대신 git이 실제로
// 인식하는 루트를 그대로 쓴다. 저장소가 아니면 null.
async function resolveRepoRoot() {
  try {
    const { stdout } = await run('git', ['rev-parse', '--show-toplevel'], PROJECT_DIR);
    return stdout.trim();
  } catch {
    return null;
  }
}

// origin이 설정돼 있는지 / 어떤 URL인지, 현재 브랜치는 무엇인지.
// 인증 정보나 토큰은 다루지 않는다 — 이미 로컬에 설정된 git 자격 증명을 그대로 사용할 뿐이다.
async function getRemoteInfo(repoRoot) {
  let remoteUrl = null;
  try {
    const { stdout } = await run('git', ['remote', 'get-url', 'origin'], repoRoot);
    remoteUrl = stdout.trim();
  } catch {
    remoteUrl = null; // origin이 없거나 조회 실패
  }

  let branch = null;
  try {
    const { stdout } = await run('git', ['rev-parse', '--abbrev-ref', 'HEAD'], repoRoot);
    branch = stdout.trim();
  } catch {
    branch = null; // 아직 커밋이 하나도 없는 갓 초기화된 저장소 등
  }

  return { remoteUrl, branch };
}

// git@github.com:user/repo.git 또는 https://github.com/user/repo.git 형태를
// 브라우저에서 열 수 있는 https://github.com/user/repo 형태로 변환
function toHttpsRepoUrl(remoteUrl) {
  let url = remoteUrl.trim();
  if (url.startsWith('git@')) {
    url = url.replace(/^git@([^:]+):/, 'https://$1/');
  }
  return url.replace(/\.git$/, '');
}

// 혹시라도 origin URL에 자격증명이 박혀 있으면(https://user:token@host/... 같은
// 드문 경우) 화면에 보여주기 전에 제거한다. 읽기 전용 상태 표시가 비밀을 노출하면 안 되므로.
function redactCredentials(remoteUrl) {
  if (!remoteUrl) return remoteUrl;
  return remoteUrl.replace(/^(https?:\/\/)[^/@]+@/, '$1');
}

async function buildGithubUrl(meta, repoRoot) {
  const { remoteUrl, branch } = await getRemoteInfo(repoRoot);
  if (!remoteUrl || !branch) return null;
  const repoHttps = toHttpsRepoUrl(remoteUrl);
  return `${repoHttps}/tree/${branch}/assignments/${meta.leaf}`;
}

// 웹에서 보여줄 읽기 전용 Git 연결 상태. URL/토큰 입력 없이, 이미 로컬에 있는
// git 저장소·origin·브랜치 정보를 그대로 조회해서 보여주기만 한다.
async function getGitStatus() {
  const repoRoot = await resolveRepoRoot();
  if (!repoRoot) {
    return {
      isGitRepo: false,
      repoRoot: null,
      hasOrigin: false,
      remoteUrl: null,
      branch: null,
      checkedAt: new Date().toISOString(),
    };
  }

  const { remoteUrl, branch } = await getRemoteInfo(repoRoot);
  return {
    isGitRepo: true,
    repoRoot,
    hasOrigin: Boolean(remoteUrl),
    remoteUrl: redactCredentials(remoteUrl),
    branch,
    checkedAt: new Date().toISOString(),
  };
}

// git add / commit / push 실행. 변경사항이 없으면 커밋은 건너뛴다.
// 항상 실제로 감지된 저장소 루트를 cwd로 사용한다 (하드코딩된 프로젝트 경로가 아니라).
async function runGitSync(message) {
  const repoRoot = await resolveRepoRoot();
  if (!repoRoot) {
    return {
      status: 'failed',
      error: '현재 프로젝트 폴더가 git 저장소가 아닙니다. README.md의 안내대로 git init을 먼저 실행해주세요.',
      repoRoot: null,
    };
  }

  try {
    await run('git', ['add', '-A'], repoRoot);

    let hasChanges = true;
    try {
      await run('git', ['diff', '--cached', '--quiet'], repoRoot);
      hasChanges = false; // exit 0 => 변경사항 없음
    } catch {
      hasChanges = true; // exit != 0 => 변경사항 있음
    }

    if (hasChanges) {
      await run('git', ['commit', '-m', message], repoRoot);
      await run('git', ['push'], repoRoot);
    }

    return { status: 'success', repoRoot };
  } catch (err) {
    const detail = err.stderr || err.message || String(err);
    return { status: 'failed', error: String(detail).slice(0, 800), repoRoot };
  }
}

// 특정 과제의 meta.json에 동기화 결과를 반영하면서 git sync를 수행한다.
// 삭제처럼 meta.json이 더 이상 존재하지 않는 경우에는 사용하지 않는다 (runGitSync를 직접 사용).
async function syncAssignmentMeta(id, message) {
  const result = await runGitSync(message);

  const entry = store.findById(id);
  if (!entry) return result; // 그 사이에 삭제된 경우

  const { meta, dir } = entry;
  const url = result.status === 'success' && result.repoRoot
    ? await buildGithubUrl(meta, result.repoRoot)
    : meta.github?.url ?? null;

  meta.github = {
    status: result.status,
    url: url ?? meta.github?.url ?? null,
    lastSyncedAt: new Date().toISOString(),
    lastError: result.status === 'failed' ? result.error : null,
  };
  store.writeMeta(dir, meta);
  return result;
}

module.exports = { runGitSync, syncAssignmentMeta, buildGithubUrl, getGitStatus, resolveRepoRoot };
