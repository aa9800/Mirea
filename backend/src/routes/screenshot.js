const express = require('express');
const { captureDevServerScreenshot } = require('../lib/screenshot');

const router = express.Router();

// POST /api/screenshot - 로컬 프로젝트 폴더 "경로"를 받아 개발 서버를 실제로 실행하고
// 소스 코드에서 자동으로 찾은 페이지 경로들을 각각 스크린샷 찍어 base64로 돌려준다.
// 아무 것도 저장하지 않는다 — 프론트가 결과 이미지들을 "실행 결과 이미지" 칸에
// 넣어주고, 사용자가 저장 버튼을 눌러야 반영된다.
//
// 브라우저의 폴더 선택(webkitdirectory)은 절대 경로를 주지 않기 때문에, 이 기능만은
// 예외적으로 경로 문자열을 직접 입력받는다 — 같은 컴퓨터에서 도는 백엔드이기 때문에
// 가능한 방식이고, 어차피 사용자가 로컬 터미널에서 npm run dev 치는 것과 같은 일을
// 대신 해주는 것뿐이라 별도의 자격증명이나 원격 접근이 필요 없다.
router.post('/', async (req, res) => {
  const { projectPath } = req.body || {};
  if (typeof projectPath !== 'string' || !projectPath.trim()) {
    return res.status(400).json({ error: '프로젝트 폴더 경로를 입력해주세요.' });
  }

  try {
    const shots = await captureDevServerScreenshot(projectPath.trim());
    res.json({
      images: shots
        .filter((s) => s.buffer)
        .map((s) => ({ path: s.path, image: `data:image/png;base64,${s.buffer.toString('base64')}` })),
      failed: shots.filter((s) => s.error).map((s) => ({ path: s.path, error: s.error })),
    });
  } catch (err) {
    console.error(err);
    const status =
      err.code === 'NOT_FOUND' ? 404 : err.code === 'NOT_A_PROJECT' ? 400 : err.code === 'NO_PUPPETEER' ? 503 : 500;
    res.status(status).json({ error: err.message || '스크린샷 촬영 중 오류가 발생했습니다.' });
  }
});

module.exports = router;
