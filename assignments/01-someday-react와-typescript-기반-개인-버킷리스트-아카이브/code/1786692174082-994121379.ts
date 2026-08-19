import type { Bucket } from "../types/bucket";

// localStorage에 버킷 목록을 저장할 때 사용하는 키
const STORAGE_KEY = "someday:buckets";

/**
 * localStorage에 저장된 버킷 목록을 불러온다.
 * 저장된 값이 없거나 형식이 올바르지 않으면 빈 배열을 반환한다.
 */
export function loadBuckets(): Bucket[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Bucket[]) : [];
  } catch (error) {
    console.error("버킷 목록을 불러오지 못했습니다.", error);
    return [];
  }
}

/**
 * 버킷 목록 전체를 localStorage에 저장한다.
 * 등록 · 수정 · 삭제 · 상태 변경 등으로 buckets 배열이 바뀔 때마다
 * App.tsx에서 호출해 localStorage와 동기화한다.
 */
export function saveBuckets(buckets: Bucket[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(buckets));
  } catch (error) {
    console.error("버킷 목록을 저장하지 못했습니다.", error);
  }
}
