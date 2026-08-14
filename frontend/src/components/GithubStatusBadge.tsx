import type { GithubInfo } from '../api/types';

const LABEL: Record<string, string> = {
  success: '✅ GitHub 업로드 완료',
  failed: '❌ GitHub 업로드 실패',
  pending: '⏳ GitHub 업로드 중...',
  not_synced: '⚪ 아직 동기화되지 않음',
};

function formatDateTime(iso: string | null) {
  if (!iso) return '-';
  return new Date(iso).toLocaleString('ko-KR', { hour12: false });
}

export default function GithubStatusBadge({ github }: { github: GithubInfo }) {
  return (
    <div className={`github-badge github-badge--${github.status}`}>
      <span className="github-badge__status">{LABEL[github.status] ?? github.status}</span>
      <span className="github-badge__time">마지막 업로드: {formatDateTime(github.lastSyncedAt)}</span>
      {github.url && (
        <a href={github.url} target="_blank" rel="noreferrer" className="github-badge__link">
          GitHub에서 보기 ↗
        </a>
      )}
      {github.status === 'failed' && github.lastError && (
        <pre className="github-badge__error">{github.lastError}</pre>
      )}
    </div>
  );
}
