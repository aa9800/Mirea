// 일회성 스크립트: 기존 과제들의 README.md를 최신 buildReadme 로직(파일 많으면 접기)으로
// 다시 생성하고, assignments/README.md 인덱스도 새로 만든다. 정상 저장 흐름에서는
// routes/assignments.js가 저장/삭제 때마다 자동으로 처리하므로, 이 스크립트는
// "이미 저장된 과거 데이터"에 새 포맷을 소급 적용할 때만 한 번 쓰면 된다.
const fs = require('fs');
const path = require('path');
const { ASSIGNMENTS_DIR } = require('../src/config');
const store = require('../src/lib/store');
const { buildReadme, buildAssignmentsIndex } = require('../src/lib/readme');

const entries = store.scanAll();
for (const { meta, dir } of entries) {
  fs.writeFileSync(path.join(dir, 'README.md'), buildReadme(meta), 'utf-8');
  console.log('regenerated:', path.relative(ASSIGNMENTS_DIR, dir));
}

fs.writeFileSync(path.join(ASSIGNMENTS_DIR, 'README.md'), buildAssignmentsIndex(store.listAssignments()), 'utf-8');
console.log('regenerated assignments/README.md index (', entries.length, 'items )');
