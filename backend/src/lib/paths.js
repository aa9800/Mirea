// 브라우저가 넘겨준 "상대 경로일 수도 있는" 문자열을 안전한 경로 세그먼트 배열로
// 정규화한다. 상위 폴더 탈출(..)이나 빈 세그먼트, 절대경로 표시 등을 걸러낸다.
// 파일 업로드 경로 복원(sourceFiles)과 임시 스크린샷 폴더 양쪽에서 같이 쓴다.
function sanitizeRelPath(raw) {
  return String(raw || '')
    .split(/[\\/]+/)
    .map((seg) => seg.trim())
    .filter((seg) => seg && seg !== '.' && seg !== '..');
}

module.exports = { sanitizeRelPath };
