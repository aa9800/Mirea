const path = require('path');

// backend/src/config.js -> 프로젝트 폴더(과제웹/). 실제 git 저장소의 루트인지는
// 보장되지 않는 "가정"일 뿐이다 — git.js가 여기서부터 `git rev-parse --show-toplevel`로
// 진짜 저장소 루트를 찾아서 그 결과를 쓴다 (하드코딩된 경로를 그대로 믿지 않는다).
const PROJECT_DIR = path.join(__dirname, '..', '..');
const ASSIGNMENTS_DIR = path.join(PROJECT_DIR, 'assignments');
const PORT = process.env.PORT || 4000;

module.exports = { PROJECT_DIR, ASSIGNMENTS_DIR, PORT };
