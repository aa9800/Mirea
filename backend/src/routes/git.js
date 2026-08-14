const express = require('express');
const git = require('../lib/git');

const router = express.Router();

// GET /api/git/status - 읽기 전용 Git 연결 상태.
// URL/토큰을 입력받지 않는다 — 이미 로컬에 설정된 git 저장소/원격/브랜치를 그대로 조회만 한다.
router.get('/status', async (req, res) => {
  try {
    const status = await git.getGitStatus();
    res.json(status);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Git 상태를 확인하는 중 오류가 발생했습니다.' });
  }
});

module.exports = router;
