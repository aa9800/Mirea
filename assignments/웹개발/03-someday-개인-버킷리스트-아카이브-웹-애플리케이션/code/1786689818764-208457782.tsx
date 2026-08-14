import { Heart, Search } from "lucide-react";
import { BUCKET_CATEGORIES, BUCKET_STATUSES, type BucketCategory, type BucketStatus } from "../types/bucket";

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  category: BucketCategory | "전체";
  onCategoryChange: (value: BucketCategory | "전체") => void;
  status: BucketStatus | "전체";
  onStatusChange: (value: BucketStatus | "전체") => void;
  sort: "createdAt" | "targetDate" | "importance";
  onSortChange: (value: "createdAt" | "targetDate" | "importance") => void;
  favoriteOnly: boolean;
  onToggleFavoriteOnly: () => void;
}

const CONTROL_STYLE =
  "rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none";

/**
 * 검색 · 카테고리 필터 · 상태 필터 · 정렬 · 즐겨찾기만 보기 · "이룬 것들" 보기를 담는 영역.
 * "이룬 것들"은 별도 로직 없이 상태 필터를 "완료"로 설정하는 방식으로 재사용한다.
 */
function FilterBar({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  status,
  onStatusChange,
  sort,
  onSortChange,
  favoriteOnly,
  onToggleFavoriteOnly,
}: FilterBarProps) {
  const showingCompletedOnly = status === "완료";

  return (
    <section className="flex flex-col gap-3 rounded-xl bg-surface-soft/60 p-4 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative flex-1 sm:min-w-[200px]">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
        <input
          type="text"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="제목 또는 카테고리 검색"
          className={`w-full py-2 pl-9 pr-3 ${CONTROL_STYLE}`}
        />
      </div>

      <select
        value={category}
        onChange={(event) => onCategoryChange(event.target.value as BucketCategory | "전체")}
        className={CONTROL_STYLE}
      >
        <option value="전체">전체 카테고리</option>
        {BUCKET_CATEGORIES.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      <select
        value={status}
        onChange={(event) => onStatusChange(event.target.value as BucketStatus | "전체")}
        className={CONTROL_STYLE}
      >
        <option value="전체">전체 상태</option>
        {BUCKET_STATUSES.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      <select
        value={sort}
        onChange={(event) => onSortChange(event.target.value as "createdAt" | "targetDate" | "importance")}
        className={CONTROL_STYLE}
      >
        <option value="createdAt">등록순</option>
        <option value="targetDate">목표일순</option>
        <option value="importance">중요도순</option>
      </select>

      <button
        type="button"
        onClick={onToggleFavoriteOnly}
        aria-pressed={favoriteOnly}
        className={`inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-medium ${
          favoriteOnly ? "border-accent bg-accent-soft text-accent" : "border-line bg-surface text-ink-soft"
        }`}
      >
        <Heart className="h-4 w-4" fill={favoriteOnly ? "currentColor" : "none"} />
        즐겨찾기만
      </button>

      <button
        type="button"
        onClick={() => onStatusChange(showingCompletedOnly ? "전체" : "완료")}
        aria-pressed={showingCompletedOnly}
        className={`rounded-lg border px-3 py-2 text-sm font-medium ${
          showingCompletedOnly ? "border-accent bg-accent-soft text-accent" : "border-line bg-surface text-ink-soft"
        }`}
      >
        이룬 것들
      </button>
    </section>
  );
}

export default FilterBar;
