import { useEffect, useState } from 'react';
import { fetchGitStatus } from '../api/client';
import type { GitStatus } from '../api/types';

// 읽기 전용 Git 연결 상태 표시. URL/토큰을 입력받는 곳이 아니다 — 이 프로젝트 폴더에
// 이미 설정된 git 저장소/origin/브랜치를 그대로 조회해서 보여주기만 한다.
export default function GitConnectionStatus() {
  const [status, setStatus] = useState<GitStatus | null>(null);

  useEffect(() => {
    fetchGitStatus()
      .then(setStatus)
      .catch(() => {}); // 보조 정보라 실패해도 화면을 막지 않는다
  }, []);

  if (!status) return null;

  const variant = !status.isGitRepo ? 'none' : !status.hasOrigin ? 'warning' : 'ok';

  return (
    <div className={`git-status git-status--${variant}`}>
      {variant === 'ok' && (
        <>
          <span className="git-status__label">✅ GitHub 자동 업로드 연결됨</span>
          <span className="git-status__detail">{status.remoteUrl}</span>
          <span className="git-status__detail">브랜치 {status.branch}</span>
        </>
      )}
      {variant === 'warning' && (
        <>
          <span className="git-status__label">⚠️ git 저장소는 있지만 origin 리모트가 없어요</span>
          <span className="git-status__detail">터미널에서 git remote add origin &lt;저장소 URL&gt; 을 실행해주세요</span>
        </>
      )}
      {variant === 'none' && (
        <>
          <span className="git-status__label">⚪ 아직 git 저장소가 아니에요</span>
          <span className="git-status__detail">이 프로젝트 폴더에서 git init을 실행하면 자동 업로드가 활성화돼요</span>
        </>
      )}
      {status.repoRoot && (
        <span className="git-status__path" title={status.repoRoot}>
          {status.repoRoot}
        </span>
      )}
    </div>
  );
}
