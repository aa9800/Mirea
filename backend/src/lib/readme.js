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

  if (meta.sourceFiles?.length) {
    // 폴더로 분석했을 때 원본 파일을 원래 경로 그대로 보존해둔 것 — AI가 재분류한
    // 코드 블록과 별개로, "진짜 백업"은 이 폴더다. GitHub에서 source/ 로 들어가면
    // 실제 폴더 구조(frontend/, backend/ 등) 그대로 볼 수 있다.
    lines.push(
      '## 원본 파일',
      '',
      `업로드한 프로젝트의 원본 파일 ${meta.sourceFiles.length}개가 폴더 구조 그대로 [source/](./source/)에 보관되어 있습니다.`,
      '',
    );
    for (const f of [...meta.sourceFiles].sort((a, b) => a.path.localeCompare(b.path))) {
      // 링크 대상은 세그먼트별로 인코딩(경로 구분자 "/"는 그대로 유지), 표시 텍스트는 원래 경로 그대로.
      const linkPath = f.path.split('/').map(encodeURIComponent).join('/');
      lines.push(`- [${f.path}](./source/${linkPath})`);
    }
    lines.push('');
  }

  if (meta.codeBlocks?.length) {
    lines.push('## 코드', '');
    // 폴더로 통째로 분석하면 코드 블록이 수십 개까지 생길 수 있어서, 그대로 다
    // 펼쳐두면 README 하나가 수천 줄짜리 벽이 된다(실제로 겪음 — 2000줄, 160KB).
    // 파일이 몇 개 안 되는 보통 과제는 지금처럼 바로 보이게 두고, 많으면(4개 초과)
    // GitHub이 지원하는 접기(<details>)로 감싸서 평소엔 파일명만 보이게 한다.
    const useCollapsible = meta.codeBlocks.length > 4;
    for (const block of meta.codeBlocks) {
      const label = block.filename || '코드';
      const codeFence = [`\`\`\`${block.language || ''}`, block.code, '```'];
      if (useCollapsible) {
        lines.push('<details>');
        lines.push(`<summary><strong>${label}</strong>${block.description ? ` — ${block.description}` : ''}</summary>`, '');
        lines.push(...codeFence, '');
        lines.push('</details>', '');
      } else {
        if (block.filename) lines.push(`**${block.filename}**`, '');
        if (block.description) lines.push(block.description, '');
        lines.push(...codeFence, '');
      }
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

  if (meta.executionResult || meta.executionResultImages?.length) {
    lines.push('## 실행 결과', '');
    if (meta.executionResult) lines.push('```', meta.executionResult, '```', '');
    for (const f of meta.executionResultImages || []) lines.push(`![${f.filename}](./images/${f.storedName})`);
    if (meta.executionResultImages?.length) lines.push('');
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

// assignments/ 바로 아래에 두는 전체 목록 인덱스 — GitHub에서 "assignments" 폴더로
// 들어가면 이 파일이 바로 보여서, 하위 폴더를 일일이 안 눌러봐도 전체 과제가 한눈에
// 쭉 보이게 한다. 실제 폴더 구조(assignments/<번호-제목>/)는 과목 구분 없이 평평하지만,
// 이 인덱스 안에서는 과목별로 묶어서 설명해주는 게 오히려 읽기 좋다는 피드백을 반영해
// 과목 섹션 + 링크 목록으로 보여준다 — "폴더를 여러 단계 눌러 들어가야 하는" 문제와
// "목록에서 과목별로 구분해서 보여주는 것"은 서로 다른 문제였다. 과제를 저장/삭제할
// 때마다 최신 상태로 다시 생성된다.
function buildAssignmentsIndex(allMeta) {
  const bySubject = new Map();
  for (const m of allMeta) {
    const key = m.subject || '(미분류)';
    if (!bySubject.has(key)) bySubject.set(key, []);
    bySubject.get(key).push(m);
  }

  const lines = ['# 과제 목록', '', `총 ${allMeta.length}개 · 과목 ${bySubject.size}개 · Study Archive에서 자동 생성됨`, ''];

  const subjects = Array.from(bySubject.keys()).sort((a, b) => a.localeCompare(b, 'ko'));
  for (const subject of subjects) {
    const items = bySubject
      .get(subject)
      .sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.createdAt || '').localeCompare(a.createdAt || ''));
    lines.push(`## ${subject} (${items.length})`, '');
    for (const m of items) {
      const favorite = m.favorite ? ' ⭐' : '';
      const tags = m.tags?.length ? ` — ${m.tags.map((t) => `\`${t}\``).join(' ')}` : '';
      // 링크는 과목 폴더 없이 평평한 실제 경로(./leaf/) 그대로 가리킨다.
      lines.push(`- **[${m.title}](./${m.leaf}/)**${favorite} · ${m.date}${tags}`);
    }
    lines.push('');
  }

  if (allMeta.length === 0) {
    lines.push('_아직 등록된 과제가 없습니다._', '');
  }

  lines.push('---', '_이 파일은 과제를 저장/삭제할 때마다 자동으로 다시 생성됩니다 — 직접 수정하지 마세요._');

  return lines.join('\n');
}

module.exports = { buildReadme, buildAssignmentsIndex };
