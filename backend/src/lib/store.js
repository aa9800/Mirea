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
  // 실행 결과 이미지(실제 실행 화면 스크린샷, 노트북 plot 등)가 있으면 무조건
  // 그걸 최우선으로 대표 이미지로 쓴다 — 일반 이미지는 폴더 분석 시 딸려온
  // 프레임워크 기본 아이콘(next.svg 등)일 수도 있어서, 진짜 프로젝트를 보여주는
  // 실행 결과보다 대표성이 떨어진다. 실행 결과 이미지도 물리적으로는 images/
  // 폴더에 저장돼 있어서 기존 fileUrl(..., 'images', ...) 그대로 쓸 수 있다.
  if (meta.executionResultImages.length > 0) {
    meta.thumbnail = meta.executionResultImages[0].storedName;
  } else if (!meta.thumbnail && meta.images?.length > 0) {
    meta.thumbnail = meta.images[0].storedName;
  }
  return meta;
}

// assignments/ 아래 모든 meta.json을 읽어서 { meta, dir } 목록으로 반환한다.
// 과목별 하위 폴더 없이 assignments/<leaf>/meta.json 한 단계로 평평하게 저장한다 —
// 카테고리 분류는 웹 화면에서만 보여주고, git 구조는 과목과 무관하게 전체가 한
// 폴더 아래 바로 모여 있도록. 개인 아카이브 규모(수십~수백 건)에서는 매번 스캔해도 충분히 빠르다.
function scanAll() {
  ensureAssignmentsDir();
  const results = [];
  for (const leaf of listDirs(ASSIGNMENTS_DIR)) {
    const dir = path.join(ASSIGNMENTS_DIR, leaf);
    const metaFile = path.join(dir, 'meta.json');
    if (!fs.existsSync(metaFile)) continue;
    try {
      const meta = normalizeMeta(JSON.parse(fs.readFileSync(metaFile, 'utf-8')));
      results.push({ meta, dir });
    } catch {
      // 손상된 meta.json은 건너뛴다
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

// assignments/ 바로 아래에서 사용 중인 최대 순번 + 1 을 계산한다 (중간 삭제되어도
// 번호가 안 꼬이도록). 과목과 무관하게 전체 과제를 통틀어 하나의 순번을 매긴다 —
// 과목별 폴더가 없어졌으니 순번도 전역이어야 "등록한 순서대로" 쭉 보인다.
function nextSequence() {
  let max = 0;
  for (const leaf of listDirs(ASSIGNMENTS_DIR)) {
    const m = leaf.match(/^(\d+)-/);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return max + 1;
}

// 새 과제를 위한 폴더(assignments/순번-제목)를 만들고 { id, leaf, dir }를 반환한다.
// id와 leaf는 같은 값이다 — 과목 접두어가 없어지면서 폴더명 자체가 곧 고유 id가 됐다.
function createAssignmentPath({ title }) {
  ensureAssignmentsDir();

  const seq = String(nextSequence()).padStart(2, '0');
  const titleSlug = slugify(title);

  let leaf = `${seq}-${titleSlug}`;
  let n = 2;
  while (fs.existsSync(path.join(ASSIGNMENTS_DIR, leaf))) {
    leaf = `${seq}-${titleSlug}-${n}`;
    n += 1;
  }

  const dir = path.join(ASSIGNMENTS_DIR, leaf);
  fs.mkdirSync(path.join(dir, 'code'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'images'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'attachments'), { recursive: true });

  return { id: leaf, leaf, dir };
}

function deleteAssignmentDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
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
};
