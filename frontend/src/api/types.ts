export type GithubStatus = 'success' | 'failed' | 'pending' | 'not_synced';

export interface GithubInfo {
  status: GithubStatus;
  url: string | null;
  lastSyncedAt: string | null;
  lastError: string | null;
}

export interface FileRef {
  filename: string;
  storedName: string;
  size: number;
}

export interface Assignment {
  id: string;
  subjectSlug: string;
  leaf: string;
  title: string;
  subject: string;
  date: string;
  description: string;
  tags: string[];
  code: string;
  codeLanguage: string;
  codeFiles: FileRef[];
  learnings: string;
  difficulties: string;
  executionResult: string;
  favorite: boolean;
  thumbnail: string | null;
  images: FileRef[];
  attachments: FileRef[];
  createdAt: string;
  updatedAt: string;
  github: GithubInfo;
}

export interface SubjectSummary {
  subject: string;
  count: number;
}

// GET /api/git/status — 읽기 전용. URL/토큰 입력은 없고, 로컬에 이미 있는
// git 저장소/원격/브랜치 정보를 그대로 조회한 결과다.
export interface GitStatus {
  isGitRepo: boolean;
  repoRoot: string | null;
  hasOrigin: boolean;
  remoteUrl: string | null;
  branch: string | null;
  checkedAt: string;
}
