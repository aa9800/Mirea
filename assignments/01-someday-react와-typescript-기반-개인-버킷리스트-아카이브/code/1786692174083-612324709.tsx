import { Calendar, CheckCircle2, Heart, Pencil, Star, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { Bucket, BucketImportance, BucketStatus } from "../types/bucket";
import { BUCKET_STATUSES } from "../types/bucket";
import { getDDayDisplay } from "../utils/date";

interface BucketCardProps {
  bucket: Bucket;
  onStatusChange: (id: string, status: BucketStatus) => void;
  onToggleFavorite: (id: string) => void;
  onEdit: (bucket: Bucket) => void;
  onDelete: (id: string) => void;
  onSaveReview: (id: string, review: string) => void;
}

// 상태별 배지 스타일 (13단계에서 최종 디자인을 다시 다듬을 예정)
const STATUS_BADGE_STYLE: Record<BucketStatus, string> = {
  "계획 중": "bg-surface-soft text-ink-soft",
  "진행 중": "bg-progress-soft text-progress",
  완료: "bg-done-soft text-done",
};

// 카드 배경도 상태에 따라 아주 옅게 톤을 다르게 준다.
const CARD_SURFACE_STYLE: Record<BucketStatus, string> = {
  "계획 중": "bg-surface border-line",
  "진행 중": "bg-surface border-progress/30",
  완료: "bg-done-soft/40 border-done/30",
};

const DDAY_TEXT_STYLE: Record<"urgent" | "normal" | "overdue", string> = {
  urgent: "text-accent",
  normal: "text-ink-soft",
  overdue: "text-rose-600",
};

// 중요도(상 · 중 · 하)를 별 3개 중 몇 개를 채울지로 표현한다.
const IMPORTANCE_LEVEL: Record<BucketImportance, number> = { 상: 3, 중: 2, 하: 1 };

/** 완료된 버킷의 후기를 입력 · 저장하는 카드 내부 인라인 편집기. */
function ReviewEditor({ bucket, onSave }: { bucket: Bucket; onSave: (id: string, review: string) => void }) {
  const [text, setText] = useState(bucket.review ?? "");

  useEffect(() => {
    setText(bucket.review ?? "");
  }, [bucket.id, bucket.review]);

  return (
    <div className="flex flex-col gap-2 rounded-lg bg-done-soft p-3">
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="완료 후기를 남겨보세요 (예: 생각보다 훨씬 재밌었다)"
        rows={2}
        className="resize-none rounded-md border border-done/30 bg-surface px-2 py-1.5 text-sm text-ink placeholder:text-ink-faint focus:border-done focus:outline-none"
      />
      <button
        type="button"
        onClick={() => onSave(bucket.id, text.trim())}
        className="self-start rounded-md bg-done px-3 py-1 text-xs font-medium text-white hover:bg-done/90"
      >
        후기 저장
      </button>
    </div>
  );
}

/**
 * 버킷 한 건을 카드 형태로 보여주는 컴포넌트.
 * 상태 변경 · 즐겨찾기 · 수정 · 삭제 · 후기 저장을 모두 이 카드에서 처리한다.
 */
function BucketCard({ bucket, onStatusChange, onToggleFavorite, onEdit, onDelete, onSaveReview }: BucketCardProps) {
  const dDay = getDDayDisplay(bucket);

  return (
    <div className={`flex h-full flex-col gap-3 rounded-2xl border p-5 shadow-sm ${CARD_SURFACE_STYLE[bucket.status]}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1.5">
          {bucket.category && (
            <span className="w-fit rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent">
              {bucket.category}
            </span>
          )}
          <h3 className="flex items-center gap-1.5 font-serif text-base font-semibold leading-snug text-ink">
            {bucket.status === "완료" && <CheckCircle2 className="h-4 w-4 shrink-0 text-done" />}
            {bucket.title}
          </h3>
        </div>
        <button
          type="button"
          onClick={() => onToggleFavorite(bucket.id)}
          aria-label="즐겨찾기"
          aria-pressed={bucket.favorite}
          className={`shrink-0 ${bucket.favorite ? "text-accent" : "text-ink-faint hover:text-accent"}`}
        >
          <Heart className="h-5 w-5" fill={bucket.favorite ? "currentColor" : "none"} />
        </button>
      </div>

      {bucket.photo && (
        <img
          src={bucket.photo}
          alt={`${bucket.title} 사진`}
          className="h-40 w-full rounded-xl object-cover"
        />
      )}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-ink-soft">
        <select
          value={bucket.status}
          onChange={(event) => onStatusChange(bucket.id, event.target.value as BucketStatus)}
          className={`rounded-full border-none px-2 py-0.5 text-xs font-medium focus:outline-none ${STATUS_BADGE_STYLE[bucket.status]}`}
        >
          {BUCKET_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        {bucket.importance && (
          <span className="inline-flex items-center gap-0.5" aria-label={`중요도 ${bucket.importance}`}>
            {[1, 2, 3].map((level) => (
              <Star
                key={level}
                className={`h-3.5 w-3.5 ${
                  level <= IMPORTANCE_LEVEL[bucket.importance!] ? "fill-accent text-accent" : "text-line"
                }`}
              />
            ))}
          </span>
        )}

        {bucket.targetDate && (
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {bucket.targetDate}
          </span>
        )}

        {dDay && <span className={`text-xs font-semibold ${DDAY_TEXT_STYLE[dDay.tone]}`}>{dDay.label}</span>}
      </div>

      {bucket.memo && <p className="text-sm leading-relaxed text-ink-soft">{bucket.memo}</p>}

      {bucket.status === "완료" && (
        <div className="flex flex-col gap-2">
          {bucket.completedAt && (
            <p className="text-xs font-medium text-done">
              완료일 {bucket.completedAt.slice(0, 10)}
            </p>
          )}
          <ReviewEditor bucket={bucket} onSave={onSaveReview} />
        </div>
      )}

      {/* 내용 길이가 카드마다 달라도 액션 영역은 항상 하단에 고정된다. */}
      <div className="mt-auto flex justify-end gap-4 pt-2 text-sm text-ink-faint">
        <button
          type="button"
          onClick={() => onEdit(bucket)}
          className="inline-flex items-center gap-1 hover:text-ink"
        >
          <Pencil className="h-4 w-4" />
          수정
        </button>
        <button
          type="button"
          onClick={() => {
            if (window.confirm(`"${bucket.title}"을(를) 삭제할까요?`)) {
              onDelete(bucket.id);
            }
          }}
          className="inline-flex items-center gap-1 hover:text-rose-600"
        >
          <Trash2 className="h-4 w-4" />
          삭제
        </button>
      </div>
    </div>
  );
}

export default BucketCard;
