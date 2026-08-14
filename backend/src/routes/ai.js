const express = require('express');
const ai = require('../lib/ai');

const router = express.Router();

// POST /api/ai/analyze - 붙여넣은 코드/텍스트 내용을 분석해 제목·과목·태그·설명·
// 코드 언어를 제안한다. 여기서 아무 것도 저장하지 않는다 — 결과는 프론트가 폼
// 필드를 채우는 데만 쓰이고, 사용자가 확인/수정 후 직접 저장해야 반영된다.
router.post('/analyze', (req, res) => {
  const { content, filename, files } = req.body || {};

  if (!ai.isConfigured()) {
    return res.status(503).json({
      error: 'AI 분석이 설정되지 않았습니다. backend/.env에 GEMINI_API_KEY를 추가해주세요.',
    });
  }

  const hasContent = typeof content === 'string' && content.trim();
  const validFiles = Array.isArray(files)
    ? files.filter((f) => f && typeof f.name === 'string' && typeof f.content === 'string')
    : [];
  const hasFiles = validFiles.length > 0;

  if (!hasContent && !hasFiles) {
    return res.status(400).json({ error: '분석할 내용이 없습니다.' });
  }

  ai.analyzeContent({
    content: hasContent ? content : undefined,
    filename: typeof filename === 'string' ? filename : undefined,
    files: hasFiles ? validFiles : undefined,
  })
    .then((suggestion) => res.json(suggestion))
    .catch((err) => {
      console.error(err);
      const status = err.code === 'AUTH' ? 401 : err.code === 'NOT_CONFIGURED' ? 503 : err.code === 'REFUSED' ? 422 : 502;
      res.status(status).json({ error: err.message || 'AI 분석 중 오류가 발생했습니다.' });
    });
});

module.exports = router;
