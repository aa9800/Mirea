// 폴더명/ID로 안전하게 쓸 수 있도록 문자열을 슬러그로 변환한다.
// 한글은 그대로 유지하고(직관적인 폴더명을 위해), 공백/특수문자만 하이픈으로 치환한다.
function slugify(input) {
  const value = String(input ?? '').trim();
  if (!value) return 'untitled';

  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'untitled';
}

function todayStr() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

module.exports = { slugify, todayStr };
