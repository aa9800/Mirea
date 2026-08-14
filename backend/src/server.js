const express = require('express');
const { PORT, ASSIGNMENTS_DIR } = require('./config');
const store = require('./lib/store');
const assignmentsRouter = require('./routes/assignments');
const gitRouter = require('./routes/git');

store.ensureAssignmentsDir();

const app = express();

app.use(express.json());
// 주의: 프론트엔드 라우트가 이미 "/assignments/*"(목록/상세/등록 화면)를 쓰고 있어서,
// 업로드된 실제 파일(이미지/코드/첨부파일)은 겹치지 않도록 "/files"로 정적 제공한다.
app.use('/files', express.static(ASSIGNMENTS_DIR));
app.use('/api/assignments', assignmentsRouter);
app.use('/api/git', gitRouter);

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: '서버 오류가 발생했습니다.' });
});

app.listen(PORT, () => {
  console.log(`✅ 백엔드 서버 실행 중: http://localhost:${PORT}`);
  console.log(`   과제 저장 위치: ${ASSIGNMENTS_DIR}`);
});
