const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn, exec } = require('child_process');

// 로컬 프로젝트 폴더를 실제로 실행해서(npm install → npm run dev/start) 화면을
// 헤드리스 브라우저로 스크린샷 찍는다. 브라우저의 폴더 선택(webkitdirectory)은
// 절대 경로를 안 주기 때문에, 이 기능만은 사용자가 직접 폴더 경로 문자열을
// 입력해야 한다 — 이 백엔드가 같은 컴퓨터에서 돌기 때문에 가능한 예외다.
//
// 이건 임의의 코드를 실제로 실행하는 기능이다. 사용자가 직접 지정한 자기 프로젝트
// 폴더에서만 동작하고(터미널에서 npm run dev 치는 것과 동일한 신뢰 수준), 자동으로
// 아무 폴더나 대상으로 삼지 않는다 — 반드시 이 경로 입력 + 버튼 클릭이 있어야 실행된다.

const NPM_CMD = 'npm';
// Windows에서는 .cmd 스크립트(npm.cmd)를 shell:true 없이 직접 spawn하면 Node 보안
// 정책상 EINVAL로 막힌다 (ant CLI 때 같은 문제를 겪었다). 여기서 shell을 타는 인자는
// 'install'/'run'/'dev'/'start' 같은 고정 문자열뿐이라(사용자 입력이 안 섞임) 안전하다.
const SPAWN_OPTS = {
  windowsHide: true,
  shell: process.platform === 'win32',
  // Vite 등 대부분의 dev 서버는 색깔 출력을 켜두면 "http://localhost:5174/"의 포트
  // 숫자 앞뒤로 ANSI 이스케이프 코드를 끼워넣는다 — URL 정규식이 못 읽는 원인이 됐다.
  // NO_COLOR/FORCE_COLOR로 최대한 색을 끄고, 그래도 남는 코드는 아래 stripAnsi로 제거한다.
  env: { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0' },
};

// eslint-disable-next-line no-control-regex
const ANSI_RE = /\x1b\[[0-9;]*[a-zA-Z]/g;
function stripAnsi(str) {
  return str.replace(ANSI_RE, '');
}

const WALK_IGNORE_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', '.next', '.claude', '.vscode', '.idea',
]);
const SOURCE_EXTS = ['.tsx', '.jsx', '.ts', '.js'];
const MAX_ROUTES = 10;

function walkFiles(dir, exts, results = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return results;
  }
  for (const entry of entries) {
    if (WALK_IGNORE_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(full, exts, results);
    } else if (exts.some((ext) => entry.name.endsWith(ext))) {
      results.push(full);
    }
  }
  return results;
}

// React Router 스타일: <Route path="/about" ...> JSX 패턴을 소스 코드에서 정규식으로 찾는다.
// (react-router-dom의 createBrowserRouter({path: ...}) 객체 설정 방식은 일반 객체와
// 구분이 안 돼서 오탐이 많아 이 버전에서는 다루지 않는다 — JSX <Route>만 인식한다.)
function detectReactRouterPaths(projectPath) {
  const srcDir = fs.existsSync(path.join(projectPath, 'src')) ? path.join(projectPath, 'src') : projectPath;
  const files = walkFiles(srcDir, SOURCE_EXTS);
  const routeRe = /<Route\b[^>]*\bpath\s*=\s*["']([^"']+)["']/g;
  const found = new Set();
  for (const file of files) {
    let text;
    try {
      text = fs.readFileSync(file, 'utf-8');
    } catch {
      continue;
    }
    let m;
    while ((m = routeRe.exec(text))) {
      found.add(m[1]);
    }
  }
  return found;
}

// Next.js 파일 기반 라우팅: app/**/page.tsx 또는 pages/**/*.tsx 파일 위치로 경로를 유추한다.
function detectNextFileRoutes(projectPath) {
  const found = new Set();
  const candidates = [
    { dir: path.join(projectPath, 'app'), appRouter: true },
    { dir: path.join(projectPath, 'src', 'app'), appRouter: true },
    { dir: path.join(projectPath, 'pages'), appRouter: false },
    { dir: path.join(projectPath, 'src', 'pages'), appRouter: false },
  ];
  for (const { dir, appRouter } of candidates) {
    if (!fs.existsSync(dir)) continue;
    for (const file of walkFiles(dir, SOURCE_EXTS)) {
      const rel = path.relative(dir, file).replace(/\\/g, '/');
      const base = path.basename(rel).replace(/\.(tsx|jsx|ts|js)$/, '');
      const dirPart = path.dirname(rel);

      if (appRouter && base !== 'page') continue;
      if (!appRouter && (/^_/.test(path.basename(rel)) || /^api(\/|$)/.test(rel))) continue;

      let routePath = appRouter ? (dirPart === '.' ? '' : `/${dirPart}`) : `/${dirPart === '.' ? '' : dirPart}/${base}`;
      routePath = routePath
        .replace(/\/index$/, '')
        .replace(/\/\([^/]+\)/g, '') // Next.js 라우트 그룹 (group) 은 URL에 안 나타남
        .replace(/\/+/g, '/');
      if (routePath === '') routePath = '/';
      if (/[[\]:]/.test(routePath)) continue; // 동적 세그먼트([id] 등)는 실제 데이터가 없어 건너뜀
      found.add(routePath);
    }
  }
  return found;
}

// 프로젝트에서 자동으로 찾을 수 있는 페이지 경로 목록을 만든다. 완벽한 라우터 파서가
// 아니라 휴리스틱이라 다 못 찾을 수 있고, 동적 경로(:id, [id])는 실제 데이터 없이는
// 의미 있게 못 찍으니 건너뛴다 — 그래도 루트("/")는 항상 포함해서 최소 한 장은 보장한다.
function detectRoutes(projectPath) {
  const found = new Set(['/']);
  for (const p of detectReactRouterPaths(projectPath)) {
    if (!/[:*]|\$\{/.test(p)) found.add(p.startsWith('/') ? p : `/${p}`);
  }
  for (const p of detectNextFileRoutes(projectPath)) found.add(p);
  return Array.from(found).slice(0, MAX_ROUTES);
}

// package.json이 없는(빌드 도구 없는 순수 HTML/CSS/JS) 프로젝트용 — 재귀적으로
// .html 파일을 찾는다. index.html이 있으면 항상 맨 앞으로 와서 첫 스크린샷이 된다.
function findHtmlFiles(projectPath) {
  const results = walkFiles(projectPath, ['.html', '.htm']);
  results.sort((a, b) => {
    const aIsIndex = path.basename(a).toLowerCase() === 'index.html';
    const bIsIndex = path.basename(b).toLowerCase() === 'index.html';
    if (aIsIndex === bIsIndex) return 0;
    return aIsIndex ? -1 : 1;
  });
  return results.slice(0, MAX_ROUTES);
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

// 빌드 도구/서버가 아예 없는 프로젝트를 위한 최소 정적 파일 서버. file://로 직접
// 열면 최신 브라우저가 ES 모듈 스크립트(<script type="module">)를 CORS로 막아버려서
// 화면이 반쯤 깨져 보일 수 있어, 진짜 http:// 로 서빙한다. 폴더 밖으로는 못 나가게 막는다.
function serveStaticDir(rootDir) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      try {
        const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
        const target = path.normalize(path.join(rootDir, urlPath));
        if (!target.startsWith(path.normalize(rootDir))) {
          res.writeHead(403);
          res.end('Forbidden');
          return;
        }
        let filePath = target;
        if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
          filePath = path.join(filePath, 'index.html');
        }
        fs.readFile(filePath, (err, data) => {
          if (err) {
            res.writeHead(404);
            res.end('Not found');
            return;
          }
          res.writeHead(200, { 'Content-Type': MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream' });
          res.end(data);
        });
      } catch (err) {
        res.writeHead(500);
        res.end(String(err));
      }
    });
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

// 여러 페이지를 순서대로 접속해 스크린샷을 찍는다 (npm dev 서버든 정적 서버든 공용).
async function shootPages(page, baseUrl, pagePaths) {
  const shots = [];
  for (const pagePath of pagePaths) {
    try {
      await page.goto(new URL(pagePath, baseUrl).href, { waitUntil: 'networkidle2', timeout: 30000 });
      await new Promise((r) => setTimeout(r, 500));
      const buffer = await page.screenshot({ type: 'png' });
      shots.push({ path: pagePath, buffer });
    } catch (err) {
      // 페이지 하나가 실패해도(예: 그 경로에서만 에러) 나머지는 계속 진행한다.
      shots.push({ path: pagePath, error: err.message });
    }
  }
  return shots;
}

function killTree(pid) {
  if (!pid) return;
  if (process.platform === 'win32') {
    exec(`taskkill /pid ${pid} /T /F`, () => {});
  } else {
    try {
      process.kill(-pid, 'SIGKILL');
    } catch {
      try {
        process.kill(pid, 'SIGKILL');
      } catch {
        // 이미 종료된 경우 등 — 무시
      }
    }
  }
}

function runCommand(cmd, args, cwd, timeoutMs) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd, ...SPAWN_OPTS });
    let stderr = '';
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      killTree(child.pid);
      reject(new Error(`${cmd} ${args.join(' ')} 실행이 ${Math.round(timeoutMs / 1000)}초 안에 끝나지 않았습니다.`));
    }, timeoutMs);
    child.stderr?.on('data', (d) => {
      stderr += stripAnsi(d.toString());
    });
    child.on('error', (err) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(err);
    });
    child.on('close', (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (code === 0) resolve();
      else reject(new Error(`${cmd} ${args.join(' ')} 실패 (exit ${code}): ${stderr.slice(-500)}`));
    });
  });
}

// 개발 서버 프로세스를 띄우고, stdout/stderr에서 "http://localhost:PORT" 같은
// URL이 찍히길 기다린다 (Vite/CRA/Next 등 대부분의 dev 서버가 이 형태로 출력한다).
// 포트를 미리 가정하지 않는 이유: 이 앱 자신도 5173을 쓰고 있어서 대상 프로젝트가
// 같은 기본 포트를 쓰면 실제로 뜬 포트가 다를 수 있다 — 출력에서 실제 URL을 읽는
// 쪽이 훨씬 안전하다.
function startDevServerAndWaitForUrl(projectPath, script, timeoutMs) {
  return new Promise((resolve, reject) => {
    const child = spawn(NPM_CMD, ['run', script], { cwd: projectPath, ...SPAWN_OPTS });
    let buffer = '';
    let settled = false;

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      killTree(child.pid);
      reject(
        new Error(
          `개발 서버가 ${Math.round(timeoutMs / 1000)}초 안에 시작하지 않았습니다.\n---\n${buffer.slice(-1000)}`,
        ),
      );
    }, timeoutMs);

    function checkForUrl(chunk) {
      buffer += stripAnsi(chunk);
      const match = buffer.match(/https?:\/\/(?:localhost|127\.0\.0\.1|\[::1\]):(\d+)\S*/);
      if (match && !settled) {
        settled = true;
        clearTimeout(timer);
        resolve({ child, url: match[0] });
      }
    }

    child.stdout?.on('data', (d) => checkForUrl(d.toString()));
    child.stderr?.on('data', (d) => checkForUrl(d.toString()));
    child.on('error', (err) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(err);
    });
    child.on('close', (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(new Error(`개발 서버 프로세스가 예상보다 일찍 종료됐습니다 (exit ${code}).\n${buffer.slice(-1000)}`));
    });
  });
}

function loadPuppeteer() {
  try {
    // eslint-disable-next-line global-require
    return require('puppeteer');
  } catch {
    const e = new Error('puppeteer 패키지가 설치되어 있지 않습니다. backend 폴더에서 npm install puppeteer를 실행해주세요.');
    e.code = 'NO_PUPPETEER';
    throw e;
  }
}

// package.json + dev/start 스크립트가 있는 프로젝트(Vite/CRA/Next 등) — 실제로
// npm install/run dev로 띄운 뒤 소스 코드에서 찾은 라우트들을 스크린샷 찍는다.
async function captureFromDevServer(projectPath, devScript, puppeteer) {
  const nodeModulesPath = path.join(projectPath, 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    await runCommand(NPM_CMD, ['install'], projectPath, 5 * 60 * 1000);
  }

  const routes = detectRoutes(projectPath);
  const { child, url } = await startDevServerAndWaitForUrl(projectPath, devScript, 60 * 1000);

  try {
    // SPA가 JS로 화면을 마저 그릴 시간을 조금 더 준다.
    await new Promise((r) => setTimeout(r, 2000));

    const browser = await puppeteer.launch({ headless: true });
    try {
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 800 });
      return await shootPages(page, url, routes);
    } finally {
      await browser.close();
    }
  } finally {
    killTree(child.pid);
  }
}

// 빌드 도구/서버가 없는 순수 HTML/CSS/JS 프로젝트 — npm install/run dev 없이,
// 폴더를 그대로 정적 파일 서버로 잠깐 띄워서 찾은 .html 파일들을 스크린샷 찍는다.
async function captureFromStaticFiles(projectPath, htmlFiles, puppeteer) {
  const server = await serveStaticDir(projectPath);
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/`;
  const pagePaths = htmlFiles.map((f) => '/' + path.relative(projectPath, f).replace(/\\/g, '/'));

  try {
    const browser = await puppeteer.launch({ headless: true });
    try {
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 800 });
      return await shootPages(page, baseUrl, pagePaths);
    } finally {
      await browser.close();
    }
  } finally {
    server.close();
  }
}

async function captureDevServerScreenshot(projectPath) {
  if (!fs.existsSync(projectPath) || !fs.statSync(projectPath).isDirectory()) {
    const e = new Error('해당 경로의 폴더를 찾을 수 없습니다. 정확한 절대 경로인지 확인해주세요.');
    e.code = 'NOT_FOUND';
    throw e;
  }

  const puppeteer = loadPuppeteer();

  const pkgPath = path.join(projectPath, 'package.json');
  let devScript = null;
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      const scripts = pkg.scripts || {};
      devScript = scripts.dev ? 'dev' : scripts.start ? 'start' : null;
    } catch {
      // package.json이 깨져 있으면 무시하고 아래 정적 파일 방식으로 폴백한다.
    }
  }

  if (devScript) {
    return captureFromDevServer(projectPath, devScript, puppeteer);
  }

  // package.json이 없거나 dev/start 스크립트가 없으면 — 빌드 도구 없는 순수
  // HTML/CSS/JS 프로젝트일 수 있으니 .html 파일을 찾아서 정적으로 서빙해본다.
  const htmlFiles = findHtmlFiles(projectPath);
  if (htmlFiles.length === 0) {
    const e = new Error(
      'package.json의 "dev"/"start" 스크립트도, .html 파일도 찾지 못했습니다 — 웹 프로젝트 폴더가 맞는지 확인해주세요.',
    );
    e.code = 'NOT_A_PROJECT';
    throw e;
  }
  return captureFromStaticFiles(projectPath, htmlFiles, puppeteer);
}

module.exports = { captureDevServerScreenshot };
