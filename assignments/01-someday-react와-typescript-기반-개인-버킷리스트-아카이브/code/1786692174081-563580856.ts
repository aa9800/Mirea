// 버킷 데이터 타입 정의 (PROJECT_PLAN.md 11. 데이터 구조 기준)

export type BucketCategory =
  | "여행"
  | "취미"
  | "도전"
  | "학습"
  | "운동"
  | "음식"
  | "기타";

export type BucketImportance = "상" | "중" | "하";

export type BucketStatus = "계획 중" | "진행 중" | "완료";

export interface Bucket {
  id: string; // 버킷을 구분하는 고유 식별자 (항상 존재, 등록 시 crypto.randomUUID()로 생성)
  title: string; // 하고 싶은 일 제목 (필수 입력, 항상 존재)
  category?: BucketCategory; // 카테고리 (선택 입력)
  targetDate?: string; // 목표일 (선택 입력) — YYYY-MM-DD 형식
  importance?: BucketImportance; // 중요도 (선택 입력)
  memo?: string; // 메모 (선택 입력)
  status: BucketStatus; // 상태 (등록 시 "계획 중"으로 자동 설정, 항상 존재)
  completedAt?: string; // 완료 처리 시 기록되는 날짜/시간 (완료 상태일 때만 값 존재), ISO 8601 형식
  review?: string; // 완료 후 후기 (선택 작성)
  photo?: string; // 사진 데이터 (base64 문자열) — 추가 기능에서만 사용
  favorite: boolean; // 즐겨찾기 여부 (항상 존재, 기본값 false)
  createdAt: string; // 생성 시각 (항상 존재), ISO 8601 형식
  updatedAt: string; // 마지막 수정 시각 (항상 존재), ISO 8601 형식
}

// 카테고리 필터 등에서 사용할 전체 카테고리 목록
export const BUCKET_CATEGORIES: BucketCategory[] = [
  "여행",
  "취미",
  "도전",
  "학습",
  "운동",
  "음식",
  "기타",
];

// 중요도 선택 목록
export const BUCKET_IMPORTANCES: BucketImportance[] = ["상", "중", "하"];

// 상태 선택 목록
export const BUCKET_STATUSES: BucketStatus[] = ["계획 중", "진행 중", "완료"];
