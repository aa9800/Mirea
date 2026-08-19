import type { Bucket, BucketCategory, BucketStatus } from "../types/bucket";

export type SortOption = "createdAt" | "targetDate" | "importance";
export type CategoryFilter = BucketCategory | "전체";
export type StatusFilter = BucketStatus | "전체";

interface FilterOptions {
  search: string;
  category: CategoryFilter;
  status: StatusFilter;
  favoriteOnly: boolean;
}

/** 검색어(제목 · 카테고리) · 카테고리 필터 · 상태 필터 · 즐겨찾기 필터를 동시에 적용한다. */
export function filterBuckets(buckets: Bucket[], { search, category, status, favoriteOnly }: FilterOptions): Bucket[] {
  const query = search.trim().toLowerCase();

  return buckets.filter((bucket) => {
    if (query) {
      const inTitle = bucket.title.toLowerCase().includes(query);
      const inCategory = (bucket.category ?? "").toLowerCase().includes(query);
      if (!inTitle && !inCategory) return false;
    }
    if (category !== "전체" && bucket.category !== category) return false;
    if (status !== "전체" && bucket.status !== status) return false;
    if (favoriteOnly && !bucket.favorite) return false;
    return true;
  });
}

const IMPORTANCE_ORDER: Record<string, number> = { 상: 0, 중: 1, 하: 2 };

/**
 * 목표일순 · 중요도순 · 등록순 정렬.
 * - 목표일순: 목표일이 없는 항목은 뒤로 보낸다.
 * - 중요도순: 상 → 중 → 하 → 미설정 순서로 정렬한다.
 * - 등록순: createdAt(ISO 문자열) 오름차순 — 원본 배열을 바꾸지 않는다.
 */
export function sortBuckets(buckets: Bucket[], option: SortOption): Bucket[] {
  const sorted = [...buckets];

  if (option === "targetDate") {
    return sorted.sort((a, b) => {
      if (!a.targetDate && !b.targetDate) return 0;
      if (!a.targetDate) return 1;
      if (!b.targetDate) return -1;
      return a.targetDate.localeCompare(b.targetDate);
    });
  }

  if (option === "importance") {
    return sorted.sort((a, b) => {
      const aValue = a.importance ? IMPORTANCE_ORDER[a.importance] : 3;
      const bValue = b.importance ? IMPORTANCE_ORDER[b.importance] : 3;
      return aValue - bValue;
    });
  }

  return sorted.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}
