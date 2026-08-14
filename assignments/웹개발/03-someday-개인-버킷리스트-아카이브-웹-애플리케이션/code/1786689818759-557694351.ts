import { differenceInCalendarDays, parseISO } from "date-fns";
import type { Bucket } from "../types/bucket";

export type DDayDisplay =
  | { tone: "overdue"; label: "목표일 지남" }
  | { tone: "urgent" | "normal"; label: string };

/**
 * 버킷의 목표일 기반 D-Day 표시를 계산한다.
 * - 목표일이 없으면 null (표시하지 않음)
 * - 완료된 버킷은 "목표일 지남" 경고를 보여줄 필요가 없으므로 null
 * - 시각(시·분·초)이 아니라 로컬 달력 날짜 기준으로 차이를 계산한다.
 */
export function getDDayDisplay(bucket: Bucket): DDayDisplay | null {
  if (!bucket.targetDate || bucket.status === "완료") return null;

  const diff = differenceInCalendarDays(parseISO(bucket.targetDate), new Date());

  if (diff < 0) return { tone: "overdue", label: "목표일 지남" };
  if (diff === 0) return { tone: "urgent", label: "D-Day" };
  return { tone: diff <= 7 ? "urgent" : "normal", label: `D-${diff}` };
}
