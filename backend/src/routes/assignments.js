const fs = require('fs');
const path = require('path');
const express = require('express');
const multer = require('multer');
const store = require('../lib/store');
const git = require('../lib/git');
const { ASSIGNMENTS_DIR } = require('../config');
const { buildReadme, buildAssignmentsIndex } = require('../lib/readme');
const { sanitizeRelPath } = require('../lib/paths');

const router = express.Router();

// 메모리에 먼저 버퍼로 받아둔 뒤, 폴더가 정해지면 그때 디스크에 쓴다.
// (multipart 필드 순서에 상관없이 title/subject로 먼저 폴더를 만들 수 있도록)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 파일당 25MB
    // codeBlocks는 파일이 아니라 텍스트 필드(JSON 문자열)라 fieldSize 제한을 받는다.
    // multer 기본값이 1MB라, 폴더 분석으로 코드 블록이 수십 개 생기면 쉽게 넘겨서
    // 업로드 자체가 깨지고 브라우저에는 그냥 "Failed to fetch"로만 보였다.
    fieldSize: 25 * 1024 * 1024,
  },
});

const uploadFields = upload.fields([
  { name: 'images' },
  { name: 'attachments' },
  { name: 'codeFiles' },
  { name: 'executionResultImages' },
  { name: 'sourceFiles' },
]);

function parseTags(raw) {
  if (!raw) return [];
  return String(raw)
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
    .filter((t, i, arr) => arr.indexOf(t) === i);
}

function parseNameList(raw) {
  if (!raw) return [];
  return String(raw)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

// 코드 블록 여러 개를 JSON 문자열(FormData 필드)로 받아 파싱한다.
// 형식이 깨졌거나 없으면 빈 배열로 처리하고, 코드가 빈 블록은 저장하지 않는다.
function parseCodeBlocks(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((b) => b && typeof b.code === 'string' && b.code.trim())
      .map((b) => ({
        language: typeof b.language === 'string' ? b.language.trim() : '',
        code: b.code.trim(),
        filename: typeof b.filename === 'string' && b.filename.trim() ? b.filename.trim() : undefined,
        description: typeof b.description === 'string' && b.description.trim() ? b.description.trim() : undefined,
      }));
  } catch {
    return [];
  }
}

function saveFiles(files, dir, subdir) {
  return (files || []).map((f) => {
    const storedName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(f.originalname)}`;
    fs.writeFileSync(path.join(dir, subdir, storedName), f.buffer);
    return { filename: f.originalname, storedName, size: f.size };
  });
}

// 폴더로 분석한 원본 파일을 "해석된" 코드 블록 등과 별개로, 원래 상대 경로 그대로
// source/ 밑에 보존한다 — 웹 화면은 AI가 해석한 내용을 보여주지만, git 백업 자체는
// 사용자가 처음 올린 원본이어야 한다는 원칙. storedName을 랜덤 생성하지 않고 원본
// 경로 자체를 실제 파일 경로로 쓴다(같은 경로로 다시 올리면 최신 버전으로 덮어써짐).
//
// 주의: 파일의 상대 경로를 File.name에 슬래시 포함해서 담아도, 브라우저가 실제
// multipart 업로드 시 그 파일명에서 경로 구분자를 잘라내버린다(직접 확인함 — Chrome도
// 예외 없음, 보안상의 동작으로 보임). 그래서 originalname은 못 믿고, 프론트가 파일들과
// "같은 순서로" 별도 텍스트 필드(sourceFilePaths, JSON 배열)에 상대 경로를 보내고
// 여기서 인덱스로 맞춰 쓴다. 그마저 없으면 그나마 원래 파일명(경로 없이)이라도 쓴다.
function saveSourceFiles(files, dir, pathsJson) {
  if (!files || files.length === 0) return [];
  let manifest = [];
  try {
    const parsed = JSON.parse(pathsJson || '[]');
    if (Array.isArray(parsed)) manifest = parsed;
  } catch {
    // 무시 — 아래에서 파일별 originalname으로 폴백
  }

  const sourceDir = path.join(dir, 'source');
  return files.map((f, i) => {
    const segments = sanitizeRelPath(manifest[i] || f.originalname);
    const relPath = segments.length ? segments.join('/') : `file-${Date.now()}-${i}`;
    const fullPath = path.join(sourceDir, ...(segments.length ? segments : [relPath]));
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, f.buffer);
    return { path: relPath, size: f.size };
  });
}

// 같은 상대 경로로 다시 올라온 파일은 최신 것으로 교체하고, 새 경로는 추가한다.
function mergeSourceFiles(existing, incoming) {
  const map = new Map((existing || []).map((s) => [s.path, s]));
  for (const s of incoming) map.set(s.path, s);
  return Array.from(map.values());
}

function removeFiles(existing, dir, subdir, toRemove) {
  if (!toRemove.length) return existing;
  const removeSet = new Set(toRemove);
  for (const f of existing) {
    if (removeSet.has(f.storedName)) {
      fs.rm(path.join(dir, subdir, f.storedName), { force: true }, () => {});
    }
  }
  return existing.filter((f) => !removeSet.has(f.storedName));
}

function writeReadme(dir, meta) {
  fs.writeFileSync(path.join(dir, 'README.md'), buildReadme(meta), 'utf-8');
}

// assignments/ 바로 아래의 전체 목록 인덱스를 최신 상태로 다시 만든다 — GitHub에서
// "assignments" 폴더로 들어가면 과목별 목록이 바로 보이도록. 과제가 등록/수정/삭제/
// 즐겨찾기 변경될 때마다 호출해서 항상 최신 상태를 유지한다.
function writeAssignmentsIndex() {
  fs.writeFileSync(path.join(ASSIGNMENTS_DIR, 'README.md'), buildAssignmentsIndex(store.listAssignments()), 'utf-8');
}

// GET /api/assignments  - 목록
router.get('/', (req, res) => {
  const { q, subject, favorite } = req.query;
  const items = store.listAssignments({
    q: typeof q === 'string' ? q : undefined,
    subject: typeof subject === 'string' ? subject : undefined,
    favorite: favorite === 'true',
  });
  res.json(items);
});

// GET /api/assignments/recent - 최근 N개 (대시보드용)
router.get('/recent', (req, res) => {
  const limit = Math.max(1, Math.min(50, Number(req.query.limit) || 6));
  res.json(store.getRecent(limit));
});

// GET /api/assignments/subjects - 과목별 개수
router.get('/subjects', (req, res) => {
  res.json(store.getSubjectsSummary());
});

// GET /api/assignments/:id - 상세
router.get('/:id', (req, res) => {
  const meta = store.readMeta(req.params.id);
  if (!meta) return res.status(404).json({ error: '과제를 찾을 수 없습니다.' });
  res.json(meta);
});

// POST /api/assignments - 신규 등록
router.post('/', uploadFields, async (req, res) => {
  try {
    const { title, subject, date, description, codeBlocks, tags, learnings, difficulties, executionResult, favorite, thumbnail, sourceFilePaths } = req.body;

    if (!title || !title.trim() || !subject || !subject.trim()) {
      return res.status(400).json({ error: '제목과 과목은 필수입니다.' });
    }

    const { id, subjectSlug, leaf, dir } = store.createAssignmentPath({ title, subject });

    const images = saveFiles(req.files?.images, dir, 'images');
    const attachments = saveFiles(req.files?.attachments, dir, 'attachments');
    const codeFiles = saveFiles(req.files?.codeFiles, dir, 'code');
    // 실행 결과 이미지도 물리적으로는 images/ 폴더에 저장한다 (별도 폴더를 만들 이유가
    // 없음 — meta.json의 배열이 분리돼 있으면 의미상 구분은 충분하다).
    const executionResultImages = saveFiles(req.files?.executionResultImages, dir, 'images');
    const sourceFiles = saveSourceFiles(req.files?.sourceFiles, dir, sourceFilePaths);

    const now = new Date().toISOString();
    const meta = {
      id,
      subjectSlug,
      leaf,
      title: title.trim(),
      subject: subject.trim(),
      date: date || now.slice(0, 10),
      description: (description || '').trim(),
      tags: parseTags(tags),
      codeBlocks: parseCodeBlocks(codeBlocks),
      codeFiles,
      sourceFiles,
      learnings: (learnings || '').trim(),
      difficulties: (difficulties || '').trim(),
      executionResult: (executionResult || '').trim(),
      executionResultImages,
      favorite: favorite === 'true' || favorite === true,
      // 실행 결과 이미지가 있으면 그게 최우선 대표 이미지 — 일반 이미지는 프레임워크
      // 기본 아이콘일 수도 있어서, 실제 실행 화면보다 대표성이 떨어진다.
      thumbnail:
        executionResultImages[0]?.storedName ??
        ((thumbnail && images.some((i) => i.storedName === thumbnail)) ? thumbnail : (images[0]?.storedName ?? null)),
      images,
      attachments,
      createdAt: now,
      updatedAt: now,
      github: { status: 'pending', url: null, lastSyncedAt: null, lastError: null },
    };

    store.writeMeta(dir, meta);
    writeReadme(dir, meta);
    writeAssignmentsIndex();
    res.status(201).json(meta);

    // 응답은 먼저 보내고, git 동기화는 백그라운드에서 진행 후 meta.json에 결과 반영
    git.syncAssignmentMeta(id, `과제 등록: ${meta.title}`).catch(() => {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '등록 중 오류가 발생했습니다.' });
  }
});

// PUT /api/assignments/:id - 수정
router.put('/:id', uploadFields, async (req, res) => {
  try {
    const { id } = req.params;
    const entry = store.findById(id);
    if (!entry) return res.status(404).json({ error: '과제를 찾을 수 없습니다.' });
    // 예전 스키마의 code/codeLanguage 단일 필드가 남아있을 수 있어 spread 전에 걷어낸다
    // (codeBlocks는 store.findById가 이미 정규화해서 채워준 상태).
    const { code: _legacyCode, codeLanguage: _legacyCodeLanguage, ...existing } = entry.meta;

    const {
      title, subject, date, description, codeBlocks, tags,
      learnings, difficulties, executionResult, favorite, thumbnail,
      removeImages, removeAttachments, removeCodeFiles, removeExecutionResultImages,
      sourceFilePaths,
    } = req.body;

    // 과목이 바뀌었으면 폴더를 새 과목 폴더로 옮긴다 (code/images/attachments는
    // 폴더째로 이동하므로 그대로 유지된다). 변경이 없으면 기존 위치 그대로 반환된다.
    const resolvedSubject = subject !== undefined ? subject.trim() : existing.subject;
    const { dir, subjectSlug, leaf, id: newId } = store.moveToSubjectIfChanged(entry, resolvedSubject);

    let images = removeFiles(existing.images, dir, 'images', parseNameList(removeImages));
    let attachments = removeFiles(existing.attachments, dir, 'attachments', parseNameList(removeAttachments));
    let codeFiles = removeFiles(existing.codeFiles, dir, 'code', parseNameList(removeCodeFiles));
    let executionResultImages = removeFiles(
      existing.executionResultImages || [],
      dir,
      'images',
      parseNameList(removeExecutionResultImages),
    );

    images = images.concat(saveFiles(req.files?.images, dir, 'images'));
    attachments = attachments.concat(saveFiles(req.files?.attachments, dir, 'attachments'));
    codeFiles = codeFiles.concat(saveFiles(req.files?.codeFiles, dir, 'code'));
    executionResultImages = executionResultImages.concat(saveFiles(req.files?.executionResultImages, dir, 'images'));
    const sourceFiles = mergeSourceFiles(existing.sourceFiles, saveSourceFiles(req.files?.sourceFiles, dir, sourceFilePaths));

    // 실행 결과 이미지가 있으면 그게 최우선 대표 이미지 — 일반 이미지는 프레임워크
    // 기본 아이콘일 수도 있어서, 실제 실행 화면보다 대표성이 떨어진다.
    const resolvedThumbnail =
      executionResultImages[0]?.storedName ??
      (thumbnail && images.some((i) => i.storedName === thumbnail)
        ? thumbnail
        : (images.some((i) => i.storedName === existing.thumbnail) ? existing.thumbnail : (images[0]?.storedName ?? null)));

    const now = new Date().toISOString();
    const meta = {
      ...existing,
      id: newId,
      subjectSlug,
      leaf,
      title: title !== undefined ? title.trim() : existing.title,
      subject: resolvedSubject,
      date: date || existing.date,
      description: description !== undefined ? description.trim() : existing.description,
      tags: tags !== undefined ? parseTags(tags) : existing.tags,
      codeBlocks: codeBlocks !== undefined ? parseCodeBlocks(codeBlocks) : existing.codeBlocks,
      codeFiles,
      sourceFiles,
      learnings: learnings !== undefined ? learnings.trim() : existing.learnings,
      difficulties: difficulties !== undefined ? difficulties.trim() : existing.difficulties,
      executionResult: executionResult !== undefined ? executionResult.trim() : existing.executionResult,
      executionResultImages,
      favorite: favorite !== undefined ? (favorite === 'true' || favorite === true) : existing.favorite,
      thumbnail: resolvedThumbnail,
      images,
      attachments,
      updatedAt: now,
      github: { ...existing.github, status: 'pending' },
    };

    store.writeMeta(dir, meta);
    writeReadme(dir, meta);
    writeAssignmentsIndex();
    res.json(meta);

    git.syncAssignmentMeta(newId, `과제 수정: ${meta.title}`).catch(() => {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '수정 중 오류가 발생했습니다.' });
  }
});

// PATCH /api/assignments/:id/favorite - 즐겨찾기 토글 (git 동기화 트리거하지 않음)
router.patch('/:id/favorite', (req, res) => {
  const entry = store.findById(req.params.id);
  if (!entry) return res.status(404).json({ error: '과제를 찾을 수 없습니다.' });

  const meta = { ...entry.meta, favorite: !entry.meta.favorite };
  store.writeMeta(entry.dir, meta);
  writeAssignmentsIndex();
  res.json(meta);
});

// DELETE /api/assignments/:id - 삭제
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const entry = store.findById(id);
  if (!entry) return res.status(404).json({ error: '과제를 찾을 수 없습니다.' });

  store.deleteAssignmentDir(entry.dir);
  writeAssignmentsIndex();

  const result = await git.runGitSync(`과제 삭제: ${entry.meta.title}`);
  if (result.status === 'failed') {
    // 로컬 삭제는 이미 반영됐으므로, 실패 사실만 알려준다.
    return res.json({ ok: true, githubSync: 'failed', error: result.error });
  }
  res.json({ ok: true, githubSync: 'success' });
});

module.exports = router;
