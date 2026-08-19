import type { Assignment, AiSuggestion, GitStatus, SubjectSummary } from './types';

const BASE = '/api/assignments';

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `요청에 실패했습니다 (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export function fileUrl(
  subjectSlug: string,
  leaf: string,
  type: 'images' | 'attachments' | 'code',
  storedName: string,
): string {
  return `/files/${encodeURIComponent(subjectSlug)}/${encodeURIComponent(leaf)}/${type}/${encodeURIComponent(storedName)}`;
}

// source/ 밑의 원본 보존 파일 — relativePath가 폴더 구조를 담은 실제 경로라
// 세그먼트별로 인코딩해야 한다 (전체를 통째로 encodeURIComponent 하면 "/"까지
// %2F로 바뀌어 경로가 깨진다).
export function sourceFileUrl(subjectSlug: string, leaf: string, relativePath: string): string {
  const encodedPath = relativePath.split('/').map(encodeURIComponent).join('/');
  return `/files/${encodeURIComponent(subjectSlug)}/${encodeURIComponent(leaf)}/source/${encodedPath}`;
}

export interface ListParams {
  q?: string;
  subject?: string;
  favorite?: boolean;
}

export async function fetchAssignments(params: ListParams = {}): Promise<Assignment[]> {
  const usp = new URLSearchParams();
  if (params.q) usp.set('q', params.q);
  if (params.subject) usp.set('subject', params.subject);
  if (params.favorite) usp.set('favorite', 'true');
  const res = await fetch(`${BASE}?${usp.toString()}`);
  return handle<Assignment[]>(res);
}

export async function fetchRecent(limit = 6): Promise<Assignment[]> {
  const res = await fetch(`${BASE}/recent?limit=${limit}`);
  return handle<Assignment[]>(res);
}

export async function fetchSubjects(): Promise<SubjectSummary[]> {
  const res = await fetch(`${BASE}/subjects`);
  return handle<SubjectSummary[]>(res);
}

export async function fetchAssignment(id: string): Promise<Assignment> {
  const res = await fetch(`${BASE}/${encodeURIComponent(id)}`);
  return handle<Assignment>(res);
}

export async function createAssignment(formData: FormData): Promise<Assignment> {
  const res = await fetch(BASE, { method: 'POST', body: formData });
  return handle<Assignment>(res);
}

export async function updateAssignment(id: string, formData: FormData): Promise<Assignment> {
  const res = await fetch(`${BASE}/${encodeURIComponent(id)}`, { method: 'PUT', body: formData });
  return handle<Assignment>(res);
}

export async function deleteAssignment(id: string): Promise<void> {
  const res = await fetch(`${BASE}/${encodeURIComponent(id)}`, { method: 'DELETE' });
  await handle(res);
}

export async function toggleFavorite(id: string): Promise<Assignment> {
  const res = await fetch(`${BASE}/${encodeURIComponent(id)}/favorite`, { method: 'PATCH' });
  return handle<Assignment>(res);
}

export async function fetchGitStatus(): Promise<GitStatus> {
  const res = await fetch('/api/git/status');
  return handle<GitStatus>(res);
}

// 로컬 프로젝트 폴더 경로를 실제로 실행(npm install/run dev)해서, 소스 코드에서
// 자동으로 찾은 페이지 경로들을 각각 스크린샷 찍어온다. 시간이 꽤 걸릴 수 있다
// (설치+서버 기동+페이지별 촬영). 저장하지 않는다 — 프론트가 반환된 이미지들을
// "실행 결과 이미지" 칸에 넣어주고, 사용자가 저장해야 반영된다.
export interface ScreenshotResult {
  images: { path: string; image: string }[];
  failed: { path: string; error: string }[];
}

// projectPath(직접 입력한 절대 경로) 또는 assignmentId(이미 폴더 분석으로 저장돼
// source/ 밑에 원본이 있는 과제) 둘 중 하나만 넘기면 된다 — assignmentId를 쓰면
// 브라우저가 절대 경로를 알려줄 수 없는 문제를 완전히 우회할 수 있다.
export async function captureScreenshot(target: { projectPath: string } | { assignmentId: string }): Promise<ScreenshotResult> {
  const res = await fetch('/api/screenshot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(target),
  });
  return handle<ScreenshotResult>(res);
}

// 저장하지 않는다 — 결과로 폼 필드를 채우기만 하고, 사용자가 확인 후 직접 저장해야 반영된다.
// content(붙여넣은 텍스트/단일 파일) 또는 files(폴더 선택 시 여러 파일) 중 하나를 채워서 호출한다.
export async function analyzeContent(input: {
  content?: string;
  filename?: string;
  files?: { name: string; content: string }[];
}): Promise<AiSuggestion> {
  const res = await fetch('/api/ai/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return handle<AiSuggestion>(res);
}
