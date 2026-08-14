import type { Assignment, GitStatus, SubjectSummary } from './types';

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
