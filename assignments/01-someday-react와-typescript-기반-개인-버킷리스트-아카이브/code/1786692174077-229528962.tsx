import { Compass } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import BucketCard from "./components/BucketCard";
import BucketForm from "./components/BucketForm";
import FilterBar from "./components/FilterBar";
import SummaryBar from "./components/SummaryBar";
import { loadBuckets, saveBuckets } from "./storage/bucketStorage";
import type { Bucket, BucketCategory, BucketStatus } from "./types/bucket";
import { filterBuckets, sortBuckets, type SortOption } from "./utils/filterSort";

// 더미 데이터의 사진 필드용 예시 이미지. Picsum(무료 플레이스홀더 사진 서비스)의
// 고정 시드 URL을 사용해 새로고침해도 항상 같은 사진이 보이도록 한다.
// 데모 데이터에 한해서만 쓰는 외부 링크이며, 실제 사진 첨부 기능은 FileReader로
// 읽어 base64로 저장하므로 계속 완전히 로컬에서 동작한다.
function demoPhoto(seed: string): string {
  return `https://picsum.photos/seed/${seed}/600/400`;
}

// localStorage가 비어있는 첫 방문 상태에서 화면 구성을 바로 확인할 수 있도록 넣는 예시 데이터.
// 실제 사용자가 한 건이라도 등록 · 삭제하면 그 이후로는 이 시드가 다시 채워지지 않는다.
function createDemoBuckets(): Bucket[] {
  const now = new Date().toISOString();
  return [
    {
      id: crypto.randomUUID(),
      title: "홋카이도 눈축제 가기",
      category: "여행",
      targetDate: "2027-02-05",
      importance: "상",
      memo: "삿포로 눈축제 시즌에 맞춰 다녀오기",
      status: "계획 중",
      favorite: true,
      photo: demoPhoto("hokkaido-snow-festival"),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      title: "하프 마라톤 완주하기",
      category: "운동",
      targetDate: "2026-10-18",
      importance: "중",
      memo: "매주 3회 이상 5km 러닝 연습",
      status: "진행 중",
      favorite: false,
      photo: demoPhoto("half-marathon-run"),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      title: "손글씨로 편지 쓰기",
      category: "취미",
      importance: "하",
      status: "완료",
      favorite: false,
      completedAt: now,
      review: "오랜만에 손으로 편지를 쓰니 생각보다 마음이 차분해졌다.",
      photo: demoPhoto("handwritten-letter"),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      title: "번지점프 도전하기",
      category: "도전",
      targetDate: "2026-08-12",
      importance: "상",
      memo: "고소공포증부터 극복하고 뛰어보기",
      status: "계획 중",
      favorite: true,
      photo: demoPhoto("bungee-jump"),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      title: "기타 연주 배우기",
      category: "학습",
      targetDate: "2026-12-20",
      importance: "중",
      memo: "온라인 강의로 좋아하는 노래 코드 3개 익히기",
      status: "진행 중",
      favorite: false,
      photo: demoPhoto("guitar-lesson"),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      title: "오마카세 먹어보기",
      category: "음식",
      importance: "하",
      status: "완료",
      favorite: false,
      completedAt: now,
      review: "가격은 부담스러웠지만 그만한 값어치가 있었다.",
      photo: demoPhoto("omakase-sushi"),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      title: "동네 도서관 회원증 만들기",
      category: "기타",
      memo: "산책 겸 걸어가서 만들고 책 한 권 빌려오기",
      status: "계획 중",
      favorite: false,
      photo: demoPhoto("library-books"),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      title: "국토 자전거 종주하기",
      category: "여행",
      targetDate: "2026-07-20",
      importance: "중",
      memo: "4대강 종주 코스 완주 인증하기",
      status: "진행 중",
      favorite: false,
      photo: demoPhoto("cycling-korea"),
      createdAt: now,
      updatedAt: now,
    },
  ];
}

/**
 * 전체 화면 구성 및 상태 관리 시작점.
 * buckets 배열은 localStorage(bucketStorage)와 동기화되어 새로고침해도 유지된다.
 * 등록 · 상태 변경 · 완료 후기 · 수정 · 삭제 · 즐겨찾기 · 검색/필터/정렬을 모두 여기서 오케스트레이션한다.
 */
function App() {
  const [buckets, setBuckets] = useState<Bucket[]>(() => {
    const stored = loadBuckets();
    return stored.length > 0 ? stored : createDemoBuckets();
  });
  const [editingBucket, setEditingBucket] = useState<Bucket | null>(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<BucketCategory | "전체">("전체");
  const [statusFilter, setStatusFilter] = useState<BucketStatus | "전체">("전체");
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("createdAt");

  // buckets가 바뀔 때마다(등록 · 수정 · 삭제 · 상태 변경 등) localStorage에 반영한다.
  useEffect(() => {
    saveBuckets(buckets);
  }, [buckets]);

  const handleAddBucket = (bucket: Bucket) => {
    setBuckets((prev) => [...prev, bucket]);
  };

  const handleUpdateBucket = (updated: Bucket) => {
    setBuckets((prev) => prev.map((bucket) => (bucket.id === updated.id ? updated : bucket)));
    setEditingBucket(null);
  };

  const handleStatusChange = (id: string, status: BucketStatus) => {
    const now = new Date().toISOString();
    setBuckets((prev) =>
      prev.map((bucket) => {
        if (bucket.id !== id) return bucket;
        if (status === "완료") {
          return { ...bucket, status, completedAt: bucket.completedAt ?? now, updatedAt: now };
        }
        // 완료에서 되돌리면 완료 날짜는 지우되, 이미 작성한 후기는 그대로 둔다.
        return { ...bucket, status, completedAt: undefined, updatedAt: now };
      }),
    );
  };

  const handleToggleFavorite = (id: string) => {
    const now = new Date().toISOString();
    setBuckets((prev) =>
      prev.map((bucket) => (bucket.id === id ? { ...bucket, favorite: !bucket.favorite, updatedAt: now } : bucket)),
    );
  };

  const handleSaveReview = (id: string, review: string) => {
    const now = new Date().toISOString();
    setBuckets((prev) =>
      prev.map((bucket) => {
        if (bucket.id !== id) return bucket;
        const next = { ...bucket, updatedAt: now };
        if (review) next.review = review;
        else delete next.review;
        return next;
      }),
    );
  };

  const handleDelete = (id: string) => {
    setBuckets((prev) => prev.filter((bucket) => bucket.id !== id));
    if (editingBucket?.id === id) setEditingBucket(null);
  };

  const visibleBuckets = useMemo(() => {
    const filtered = filterBuckets(buckets, { search, category: categoryFilter, status: statusFilter, favoriteOnly });
    return sortBuckets(filtered, sortOption);
  }, [buckets, search, categoryFilter, statusFilter, favoriteOnly, sortOption]);

  const hasAnyBuckets = buckets.length > 0;
  const hasVisibleBuckets = visibleBuckets.length > 0;

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-12">
        <header className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
              <Compass className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-ink-faint">
                Personal Archive
              </p>
              <h1 className="font-serif text-2xl font-semibold text-ink">Someday</h1>
            </div>
          </div>
          <p className="text-sm text-ink-soft">
            언젠가 해보고 싶은 일들을 모아, 이뤄가는 순간까지 기록해보세요.
          </p>
        </header>

        {/* 등록된 버킷이 없을 때는 통계보다 첫 등록 행동이 먼저 보이도록 요약 영역을 숨긴다. */}
        {hasAnyBuckets && <SummaryBar buckets={buckets} />}

        <BucketForm
          onAdd={handleAddBucket}
          onUpdate={handleUpdateBucket}
          editingBucket={editingBucket}
          onCancelEdit={() => setEditingBucket(null)}
        />

        <FilterBar
          search={search}
          onSearchChange={setSearch}
          category={categoryFilter}
          onCategoryChange={setCategoryFilter}
          status={statusFilter}
          onStatusChange={setStatusFilter}
          sort={sortOption}
          onSortChange={setSortOption}
          favoriteOnly={favoriteOnly}
          onToggleFavoriteOnly={() => setFavoriteOnly((prev) => !prev)}
        />

        {!hasAnyBuckets && (
          <section className="flex flex-col items-center gap-2 rounded-2xl bg-surface-soft px-6 py-14 text-center">
            <Compass className="h-6 w-6 text-accent" />
            <p className="text-base font-medium text-ink">아직 남긴 Someday가 없어요.</p>
            <p className="text-sm text-ink-soft">
              위에서 제목만 적어도 괜찮아요 — 첫 번째 버킷을 남겨보세요.
            </p>
          </section>
        )}

        {hasAnyBuckets && !hasVisibleBuckets && (
          <section className="flex flex-col items-center gap-2 rounded-2xl bg-surface-soft px-6 py-14 text-center">
            <p className="text-base font-medium text-ink">조건에 맞는 버킷이 없어요.</p>
            <p className="text-sm text-ink-soft">검색어나 필터를 확인해보세요.</p>
          </section>
        )}

        {hasVisibleBuckets && (
          <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2">
            {visibleBuckets.map((bucket) => (
              <BucketCard
                key={bucket.id}
                bucket={bucket}
                onStatusChange={handleStatusChange}
                onToggleFavorite={handleToggleFavorite}
                onEdit={setEditingBucket}
                onDelete={handleDelete}
                onSaveReview={handleSaveReview}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
