const fs = require('fs');
const path = require('path');
const { ASSIGNMENTS_DIR } = require('../config');
const { slugify } = require('./slug');

function ensureAssignmentsDir() {
  fs.mkdirSync(ASSIGNMENTS_DIR, { recursive: true });
}

function listDirs(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

// 예전 스키마(code/codeLanguage 단일 필드)로 저장된 meta.json을 읽을 때
// codeBlocks 배열 형태로 맞춰준다. 새로 저장할 때는 항상 codeBlocks로 쓰이므로
// 이 변환은 아직 마이그레이션 안 된 옛 파일을 읽을 때만 동작한다.
function normalizeMeta(meta) {
  if (!Array.isArray(meta.codeBlocks)) {
    meta.codeBlocks = meta.code ? [{ language: meta.codeLanguage || '', code: meta.code }] : [];
  }
  if (!Array.isArray(meta.executionResultImages)) {
    meta.executionResultImages = [];
  }
  if (!Array.isArray(meta.sourceFiles)) {
    meta.sourceFiles = [];
  }
  return meta;
}

// assignments/ 아래 모든 meta.json을 읽어서 { meta, dir } 목록으로 반환한다.
// 개인 아카이브 규모(수십~수백 건)에서는 매번 스캔해도 충분히 빠르다.
function scanAll() {
  ensureAssignmentsDir();
  const results = [];
  for (const subjectSlug of listDirs(ASSIGNMENTS_DIR)) {
    const subjectDir = path.join(ASSIGNMENTS_DIR, subjectSlug);
    for (const leaf of listDirs(subjectDir)) {
      const dir = path.join(subjectDir, leaf);
      const metaFile = path.join(dir, 'meta.json');
      if (!fs.existsSync(metaFile)) continue;
      try {
        const meta = normalizeMeta(JSON.parse(fs.readFileSync(metaFile, 'utf-8')));
        results.push({ meta, dir });
      } catch {
        // 손상된 meta.json은 건너뛴다
      }
    }
  }
  return results;
}

function findById(id) {
  return scanAll().find((entry) => entry.meta.id === id) || null;
}

function readMeta(id) {
  return findById(id)?.meta ?? null;
}

function writeMeta(dir, meta) {
  fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify(meta, null, 2), 'utf-8');
}

function listAssignments({ q, subject, favorite } = {}) {
  let items = scanAll().map((entry) => entry.meta);

  if (subject) {
    items = items.filter((a) => a.subject === subject);
  }
  if (favorite) {
    items = items.filter((a) => a.favorite);
  }
  if (q && q.trim()) {
    const needle = q.trim().toLowerCase();
    items = items.filter((a) => {
      // 제목/설명/태그뿐 아니라 코드(여러 블록)·실행 결과·배운 점·어려웠던 점까지 검색 대상에 포함한다.
      const haystack = [
        a.title,
        a.description,
        a.executionResult,
        a.learnings,
        a.difficulties,
        ...(a.tags || []),
        ...(a.codeBlocks || []).flatMap((b) => [b.code, b.language, b.filename, b.description]),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(needle);
    });
  }

  return items.sort((a, b) => {
    return (
      (b.date || '').localeCompare(a.date || '') || (b.createdAt || '').localeCompare(a.createdAt || '')
    );
  });
}

function getRecent(limit = 6) {
  return listAssignments().slice(0, limit);
}

function getSubjectsSummary() {
  const items = listAssignments();
  const map = new Map();
  for (const a of items) {
    const key = a.subject || '(미분류)';
    map.set(key, (map.get(key) || 0) + 1);
  }
  return Array.from(map.entries()).map(([subject, count]) => ({ subject, count }));
}

// 과목 폴더 안에서 사용 중인 최대 순번 + 1 을 계산한다 (중간 삭제되어도 번호가 안 꼬이도록).
function nextSequence(subjectDir) {
  let max = 0;
  for (const leaf of listDirs(subjectDir)) {
    const m = leaf.match(/^(\d+)-/);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return max + 1;
}

// 새 과제를 위한 폴더(과목/순번-제목)를 만들고 { id, subjectSlug, leaf, dir }를 반환한다.
function createAssignmentPath({ title, subject }) {
  ensureAssignmentsDir();
  const subjectSlug = slugify(subject);
  const subjectDir = path.join(ASSIGNMENTS_DIR, subjectSlug);
  fs.mkdirSync(subjectDir, { recursive: true });

  const seq = String(nextSequence(subjectDir)).padStart(2, '0');
  const titleSlug = slugify(title);

  let leaf = `${seq}-${titleSlug}`;
  let n = 2;
  while (fs.existsSync(path.join(subjectDir, leaf))) {
    leaf = `${seq}-${titleSlug}-${n}`;
    n += 1;
  }

  const dir = path.join(subjectDir, leaf);
  fs.mkdirSync(path.join(dir, 'code'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'images'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'attachments'), { recursive: true });

  return { id: `${subjectSlug}-${leaf}`, subjectSlug, leaf, dir };
}

// 과목 폴더가 비어 있으면(안의 과제 폴더를 다 옮기거나 지운 경우) 함께 정리한다.
// git은 어차피 빈 디렉터리를 추적하지 않으므로 순전히 로컬 정리용이다.
function removeIfEmptySubjectDir(subjectDir) {
  try {
    if (fs.existsSync(subjectDir) && fs.readdirSync(subjectDir).length === 0) {
      fs.rmdirSync(subjectDir);
    }
  } catch {
    // 동시성 등으로 실패해도 무시 — 다음 정리 기회에 다시 시도된다.
  }
}

function deleteAssignmentDir(dir) {
  const subjectDir = path.dirname(dir);
  fs.rmSync(dir, { recursive: true, force: true });
  removeIfEmptySubjectDir(subjectDir);
}

// 수정 중 과목이 바뀌면(슬러그 기준) 폴더 전체를 새 과목 폴더로 옮긴다.
// 폴더 안 code/images/attachments는 그대로 딸려가므로 파일 경로는 건드릴 필요 없다.
// 같은 슬러그로 귀결되는 경우(대소문자 차이 등)는 불필요한 폴더 이동을 하지 않는다.
function moveToSubjectIfChanged(entry, newSubject) {
  const newSubjectSlug = slugify(newSubject);
  if (newSubjectSlug === entry.meta.subjectSlug) {
    return { dir: entry.dir, subjectSlug: entry.meta.subjectSlug, leaf: entry.meta.leaf, id: entry.meta.id };
  }

  const newSubjectDir = path.join(ASSIGNMENTS_DIR, newSubjectSlug);
  fs.mkdirSync(newSubjectDir, { recursive: true });

  const titleSlug = entry.meta.leaf.replace(/^\d+-/, '');
  const seq = String(nextSequence(newSubjectDir)).padStart(2, '0');
  let leaf = `${seq}-${titleSlug}`;
  let n = 2;
  while (fs.existsSync(path.join(newSubjectDir, leaf))) {
    leaf = `${seq}-${titleSlug}-${n}`;
    n += 1;
  }

  const newDir = path.join(newSubjectDir, leaf);
  const oldSubjectDir = path.dirname(entry.dir);
  fs.renameSync(entry.dir, newDir);
  removeIfEmptySubjectDir(oldSubjectDir);

  return { dir: newDir, subjectSlug: newSubjectSlug, leaf, id: `${newSubjectSlug}-${leaf}` };
}

module.exports = {
  ensureAssignmentsDir,
  scanAll,
  findById,
  readMeta,
  writeMeta,
  listAssignments,
  getRecent,
  getSubjectsSummary,
  createAssignmentPath,
  deleteAssignmentDir,
  moveToSubjectIfChanged,
};
