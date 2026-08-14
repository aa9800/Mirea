import { useState } from 'react';
import type { KeyboardEvent } from 'react';

interface Props {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export default function TagInput({ tags, onChange }: Props) {
  const [draft, setDraft] = useState('');

  function commitDraft() {
    // 쉼표로 구분해 여러 개를 한 번에 입력/붙여넣기 해도 각각 태그로 분리한다.
    const parts = draft
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (parts.length) {
      const merged = [...tags];
      for (const p of parts) {
        if (!merged.includes(p)) merged.push(p);
      }
      onChange(merged);
    }
    setDraft('');
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commitDraft();
    } else if (e.key === 'Backspace' && draft === '' && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  }

  function removeTag(tag: string) {
    onChange(tags.filter((t) => t !== tag));
  }

  return (
    <div className="tag-input">
      {tags.map((tag) => (
        <span key={tag} className="tag-chip">
          {tag}
          <button type="button" onClick={() => removeTag(tag)} aria-label={`${tag} 삭제`}>
            ×
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commitDraft}
        placeholder="태그 입력 후 Enter (예: python, 로봇팔)"
      />
    </div>
  );
}
