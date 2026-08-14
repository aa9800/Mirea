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
