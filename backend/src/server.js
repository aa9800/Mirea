require('dotenv').config();

const express = require('express');
const { PORT, ASSIGNMENTS_DIR } = require('./config');
const store = require('./lib/store');
const ai = require('./lib/ai');
const assignmentsRouter = require('./routes/assignments');
const gitRouter = require('./routes/git');
const aiRouter = require('./routes/ai');

store.ensureAssignmentsDir();

const app = express();

// AI 분석 요청에 코드 파일 내용을 통째로 담아 보낼 수 있어 기본 100kb보다 넉넉하게 잡는다.
app.use(express.json({ limit: '5mb' }));
// 주의: 프론트엔드 라우트가 이미 "/assignments/*"(목록/상세/등록 화면)를 쓰고 있어서,
// 업로드된 실제 파일(이미지/코드/첨부파일)은 겹치지 않도록 "/files"로 정적 제공한다.
app.use('/files', express.static(ASSIGNMENTS_DIR));
app.use('/api/assignments', assignmentsRouter);
app.use('/api/git', gitRouter);
app.use('/api/ai', aiRouter);

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: '서버 오류가 발생했습니다.' });
});

app.listen(PORT, () => {
  console.log(`✅ 백엔드 서버 실행 중: http://localhost:${PORT}`);
  console.log(`   과제 저장 위치: ${ASSIGNMENTS_DIR}`);
  if (!ai.isConfigured()) {
    console.log('   ℹ️ GEMINI_API_KEY(또는 ANTHROPIC_API_KEY)가 없어 AI 자동 채우기 기능은 비활성화 상태예요.');
  }
});
