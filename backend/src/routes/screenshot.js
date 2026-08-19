const fs = require('fs');
const os = require('os');
const path = require('path');
const express = require('express');
const multer = require('multer');
const store = require('../lib/store');
const { sanitizeRelPath } = require('../lib/paths');
const { captureDevServerScreenshot } = require('../lib/screenshot');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024, fieldSize: 25 * 1024 * 1024 },
});

function shotsToResponse(shots) {
  return {
    images: shots
      .filter((s) => s.buffer)
      .map((s) => ({ path: s.path, image: `data:image/png;base64,${s.buffer.toString('base64')}` })),
    failed: shots.filter((s) => s.error).map((s) => ({ path: s.path, error: s.error })),
  };
}

function screenshotErrorStatus(err) {
  return err.code === 'NOT_FOUND' ? 404 : err.code === 'NOT_A_PROJECT' ? 400 : err.code === 'NO_PUPPETEER' ? 503 : 500;
}

// POST /api/screenshot - 로컬 프로젝트 폴더 "경로"를 받아 개발 서버를 실제로 실행하고
// 소스 코드에서 자동으로 찾은 페이지 경로들을 각각 스크린샷 찍어 base64로 돌려준다.
// 아무 것도 저장하지 않는다 — 프론트가 결과 이미지들을 "실행 결과 이미지" 칸에
// 넣어주고, 사용자가 저장 버튼을 눌러야 반영된다.
//
// 브라우저의 폴더 선택(webkitdirectory)은 절대 경로를 주지 않기 때문에, 원래는
// 예외적으로 경로 문자열을 직접 입력받아야 했다 — 그런데 폴더로 분석해서 이미
// 저장된 과제라면 원본이 source/ 밑에 서버 디스크에 그대로 있으므로, assignmentId만
// 주면 경로 입력 없이 바로 그 폴더를 대상으로 쓸 수 있다. projectPath(직접 입력)와
// assignmentId(저장된 과제 재사용) 둘 중 하나만 오면 된다.
router.post('/', async (req, res) => {
  const { projectPath, assignmentId } = req.body || {};

  let resolvedPath = typeof projectPath === 'string' ? projectPath.trim() : '';

  if (!resolvedPath && assignmentId) {
    const entry = store.findById(assignmentId);
    if (!entry) return res.status(404).json({ error: '과제를 찾을 수 없습니다.' });
    if (!entry.meta.sourceFiles?.length) {
      return res.status(400).json({
        error: '이 과제엔 폴더 분석으로 보존된 원본 파일이 없어요. "폴더로 분석"을 먼저 실행하거나 경로를 직접 입력해주세요.',
      });
    }
    resolvedPath = path.join(entry.dir, 'source');
  }

  if (!resolvedPath) {
    return res.status(400).json({ error: '프로젝트 폴더 경로를 입력해주세요.' });
  }

  try {
    const shots = await captureDevServerScreenshot(resolvedPath);
    res.json(shotsToResponse(shots));
  } catch (err) {
    console.error(err);
    res.status(screenshotErrorStatus(err)).json({ error: err.message || '스크린샷 촬영 중 오류가 발생했습니다.' });
  }
});

// POST /api/screenshot/from-files - 아직 저장 전인 과제(새로 등록하는 중)를 위한 경로.
// "폴더로 분석" 직후, 방금 읽은 원본 파일들을 그대로 여기로 보내면 임시 폴더에 잠깐
// 풀어놓고 스크린샷을 찍은 뒤 즉시 정리한다 — 경로 입력도, 먼저 저장하는 것도 필요
// 없다. sourceFiles 업로드와 완전히 같은 방식(파일 + 같은 순서의 경로 매니페스트)을 쓴다.
router.post('/from-files', upload.array('sourceFiles'), async (req, res) => {
  const files = req.files;
  if (!files || files.length === 0) {
    return res.status(400).json({ error: '파일이 없습니다.' });
  }

  let manifest = [];
  try {
    const parsed = JSON.parse(req.body?.sourceFilePaths || '[]');
    if (Array.isArray(parsed)) manifest = parsed;
  } catch {
    // 무시 — 아래에서 파일별 originalname으로 폴백
  }

  const tempDir = path.join(os.tmpdir(), `study-archive-screenshot-${Date.now()}-${Math.round(Math.random() * 1e9)}`);

  try {
    for (let i = 0; i < files.length; i++) {
      const segments = sanitizeRelPath(manifest[i] || files[i].originalname);
      const relPath = segments.length ? segments.join('/') : `file-${i}`;
      const fullPath = path.join(tempDir, ...(segments.length ? segments : [relPath]));
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      fs.writeFileSync(fullPath, files[i].buffer);
    }

    const shots = await captureDevServerScreenshot(tempDir);
    res.json(shotsToResponse(shots));
  } catch (err) {
    console.error(err);
    res.status(screenshotErrorStatus(err)).json({ error: err.message || '스크린샷 촬영 중 오류가 발생했습니다.' });
  } finally {
    fs.rm(tempDir, { recursive: true, force: true }, () => {});
  }
});

module.exports = router;
