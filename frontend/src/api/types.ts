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

// 과제 하나에 코드가 여러 개(언어가 서로 달라도) 있을 수 있어 블록 배열로 관리한다.
// filename은 폴더 분석으로 자동 채워진 경우 원본 파일명을 표시용으로 남긴 것.
export interface CodeBlock {
  language: string;
  code: string;
  filename?: string;
  description?: string;
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
  codeBlocks: CodeBlock[];
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

// POST /api/ai/analyze 응답 — 저장하지 않고 폼 필드를 채우는 데만 쓰는 초안 제안.
// codeLanguage는 붙여넣기/단일 파일 분석에서 코드 블록 하나의 언어를 제안할 때만 쓰인다
// (폴더 분석은 파일 확장자로 언어를 정하므로 이 값을 쓰지 않는다).
// learnings/difficulties/executionResult는 실제로 실행해본 게 아니라 코드를 읽고
// AI가 추정한 값이라 빈 문자열일 수 있다 — 사용자가 반드시 확인해야 한다.
export interface AiSuggestion {
  title: string;
  subject: string;
  tags: string[];
  description: string;
  codeLanguage: string;
  learnings: string;
  difficulties: string;
  executionResult: string;
  // 폴더(여러 파일) 분석일 때만 채워진다 — 파일명으로 각 코드 블록에 매칭해서 쓴다.
  fileDescriptions?: { filename: string; description: string }[];
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
