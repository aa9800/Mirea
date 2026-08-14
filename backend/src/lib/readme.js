// meta.json 내용을 GitHub에서 보기 좋은 README.md로 렌더링한다.
// 앱은 이 파일을 읽지 않는다 (meta.json이 유일한 source of truth) — 순수 파생 산출물.
function buildReadme(meta) {
  const lines = [`# ${meta.title}`, ''];

  lines.push(`- 과목: ${meta.subject}`);
  lines.push(`- 날짜: ${meta.date}`);
  if (meta.tags?.length) lines.push(`- 태그: ${meta.tags.join(', ')}`);
  lines.push('');

  if (meta.description) {
    lines.push('## 설명', '', meta.description, '');
  }

  if (meta.codeBlocks?.length) {
    lines.push('## 코드', '');
    for (const block of meta.codeBlocks) {
      if (block.filename) lines.push(`**${block.filename}**`, '');
      if (block.description) lines.push(block.description, '');
      lines.push(`\`\`\`${block.language || ''}`, block.code, '```', '');
    }
  }

  if (meta.codeFiles?.length) {
    lines.push('## 코드 파일', '');
    for (const f of meta.codeFiles) lines.push(`- [${f.filename}](./code/${f.storedName})`);
    lines.push('');
  }

  if (meta.images?.length) {
    lines.push('## 이미지', '');
    for (const f of meta.images) {
      const mark = f.storedName === meta.thumbnail ? ' (대표)' : '';
      lines.push(`![${f.filename}](./images/${f.storedName})${mark}`);
    }
    lines.push('');
  }

  if (meta.executionResult) {
    lines.push('## 실행 결과', '', '```', meta.executionResult, '```', '');
  }

  if (meta.attachments?.length) {
    lines.push('## 첨부파일', '');
    for (const f of meta.attachments) lines.push(`- [${f.filename}](./attachments/${f.storedName})`);
    lines.push('');
  }

  if (meta.learnings) lines.push('## 배운 점', '', meta.learnings, '');
  if (meta.difficulties) lines.push('## 어려웠던 점', '', meta.difficulties, '');

  lines.push('---', `_Study Archive에서 자동 생성됨 · 마지막 수정: ${meta.updatedAt}_`);

  return lines.join('\n');
}

module.exports = { buildReadme };
