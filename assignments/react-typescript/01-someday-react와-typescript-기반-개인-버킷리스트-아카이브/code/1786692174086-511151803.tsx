import type { Bucket } from "../types/bucket";

interface SummaryBarProps {
  buckets: Bucket[];
}

/**
 * 전체 달성률 · 올해 목표 현황을 보여주는 요약 영역.
 * 버킷 카드 · 등록 폼이 화면의 주요 콘텐츠이므로, 이 영역은 흰 카드가 아닌
 * 얇은 보조 영역으로 표현한다.
 */
function SummaryBar({ buckets }: SummaryBarProps) {
  const total = buckets.length;
  const completedCount = buckets.filter((bucket) => bucket.status === "완료").length;
  const achievementRate = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  const currentYear = new Date().getFullYear();
  const yearGoals = buckets.filter(
    (bucket) => bucket.targetDate && Number(bucket.targetDate.slice(0, 4)) === currentYear,
  );
  const yearCompleted = yearGoals.filter((bucket) => bucket.status === "완료").length;

  return (
    <section className="flex flex-col gap-4 border-y border-line/70 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-ink-soft">전체 달성률</span>
          <span className="text-ink-faint">{achievementRate}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-soft">
          <div className="h-full rounded-full bg-accent" style={{ width: `${achievementRate}%` }} />
        </div>
      </div>

      <div className="flex items-center gap-6 text-sm text-ink-soft sm:pl-6">
        <div className="flex flex-col items-center">
          <span className="text-lg font-semibold text-ink">{yearGoals.length}</span>
          <span>올해 목표</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-lg font-semibold text-ink">{yearCompleted}</span>
          <span>올해 완료</span>
        </div>
      </div>
    </section>
  );
}

export default SummaryBar;
