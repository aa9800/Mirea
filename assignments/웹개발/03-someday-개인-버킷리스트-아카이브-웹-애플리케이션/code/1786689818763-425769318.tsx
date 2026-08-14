import { ImagePlus, X } from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import {
  BUCKET_CATEGORIES,
  BUCKET_IMPORTANCES,
  type Bucket,
  type BucketCategory,
  type BucketImportance,
} from "../types/bucket";
import { readAndResizeImage } from "../utils/image";

interface BucketFormProps {
  /** 새로 생성된 버킷을 상위(App)로 전달한다. localStorage 반영은 App의 useEffect가 담당한다. */
  onAdd: (bucket: Bucket) => void;
  /** 수정 모드에서 저장 버튼을 눌렀을 때 호출된다. */
  onUpdate: (bucket: Bucket) => void;
  /** 수정 중인 버킷. null이면 등록 모드로 동작한다. */
  editingBucket: Bucket | null;
  /** 수정을 취소하고 등록 모드로 되돌린다. */
  onCancelEdit: () => void;
}

/**
 * 버킷 등록 · 수정 폼. editingBucket이 있으면 그 값으로 필드를 채우고
 * 제출 시 onUpdate를, 없으면 onAdd를 호출한다(같은 폼을 그대로 재사용).
 * 제목만 필수로 입력받고, 나머지 항목은 선택 입력으로 둔다.
 */
function BucketForm({ onAdd, onUpdate, editingBucket, onCancelEdit }: BucketFormProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<BucketCategory | "">("");
  const [targetDate, setTargetDate] = useState("");
  const [importance, setImportance] = useState<BucketImportance | "">("");
  const [memo, setMemo] = useState("");
  const [photo, setPhoto] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = editingBucket !== null;

  // 수정 대상이 바뀌면 폼 필드를 그 값으로 채우고, 취소되면 등록 모드로 비운다.
  useEffect(() => {
    if (editingBucket) {
      setTitle(editingBucket.title);
      setCategory(editingBucket.category ?? "");
      setTargetDate(editingBucket.targetDate ?? "");
      setImportance(editingBucket.importance ?? "");
      setMemo(editingBucket.memo ?? "");
      setPhoto(editingBucket.photo ?? "");
      setPhotoError("");
      setError("");
    } else {
      setTitle("");
      setCategory("");
      setTargetDate("");
      setImportance("");
      setMemo("");
      setPhoto("");
      setPhotoError("");
      setError("");
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [editingBucket]);

  // 사진 파일을 선택하면 읽어서 축소한 뒤 미리보기(base64)로 저장한다.
  const handlePhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setPhotoError("이미지 파일만 첨부할 수 있어요.");
      event.target.value = "";
      return;
    }

    setPhotoError("");
    setIsProcessingPhoto(true);
    try {
      const resized = await readAndResizeImage(file);
      setPhoto(resized);
    } catch {
      setPhotoError("사진을 처리하지 못했어요. 다른 사진으로 시도해주세요.");
    } finally {
      setIsProcessingPhoto(false);
      event.target.value = "";
    }
  };

  const handleRemovePhoto = () => {
    setPhoto("");
    setPhotoError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("제목을 입력해주세요.");
      return;
    }

    const now = new Date().toISOString();
    const trimmedMemo = memo.trim();

    if (isEditing && editingBucket) {
      const updated: Bucket = {
        ...editingBucket,
        title: trimmedTitle,
        updatedAt: now,
      };
      delete updated.category;
      delete updated.targetDate;
      delete updated.importance;
      delete updated.memo;
      delete updated.photo;

      onUpdate({
        ...updated,
        ...(category && { category }),
        ...(targetDate && { targetDate }),
        ...(importance && { importance }),
        ...(trimmedMemo && { memo: trimmedMemo }),
        ...(photo && { photo }),
      });
      return;
    }

    const newBucket: Bucket = {
      id: crypto.randomUUID(),
      title: trimmedTitle,
      status: "계획 중",
      favorite: false,
      createdAt: now,
      updatedAt: now,
      ...(category && { category }),
      ...(targetDate && { targetDate }),
      ...(importance && { importance }),
      ...(trimmedMemo && { memo: trimmedMemo }),
      ...(photo && { photo }),
    };

    onAdd(newBucket);

    setTitle("");
    setCategory("");
    setTargetDate("");
    setImportance("");
    setMemo("");
    setPhoto("");
    setPhotoError("");
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-7"
    >
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.15em] text-accent">
          {isEditing ? "Someday 수정" : "Someday 등록"}
        </p>
        <h2 className="mt-1 font-serif text-lg font-semibold text-ink">
          {isEditing ? "버킷 내용을 고쳐볼까요?" : "오늘, 어떤 걸 해보고 싶나요?"}
        </h2>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="title" className="text-sm font-medium text-ink">
          제목 <span className="text-rose-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            if (error) setError("");
          }}
          placeholder="하고 싶은 일을 입력하세요"
          className={`rounded-lg border px-3 py-2.5 text-base text-ink placeholder:text-ink-faint focus:outline-none ${
            error ? "border-rose-400 focus:border-rose-400" : "border-line focus:border-accent"
          }`}
        />
        {error && <p className="text-xs text-rose-500">{error}</p>}
      </div>

      <div className="flex flex-col gap-3 border-t border-line pt-4">
        <p className="text-xs font-medium uppercase tracking-[0.1em] text-ink-faint">
          선택 입력 · 나중에 채워도 괜찮아요
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="category" className="text-sm text-ink-soft">
              카테고리
            </label>
            <select
              id="category"
              value={category}
              onChange={(event) => setCategory(event.target.value as BucketCategory | "")}
              className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
            >
              <option value="">선택 안 함</option>
              {BUCKET_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="targetDate" className="text-sm text-ink-soft">
              목표일
            </label>
            <input
              id="targetDate"
              type="date"
              value={targetDate}
              onChange={(event) => setTargetDate(event.target.value)}
              className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="importance" className="text-sm text-ink-soft">
              중요도
            </label>
            <select
              id="importance"
              value={importance}
              onChange={(event) => setImportance(event.target.value as BucketImportance | "")}
              className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
            >
              <option value="">선택 안 함</option>
              {BUCKET_IMPORTANCES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="memo" className="text-sm text-ink-soft">
            메모
          </label>
          <textarea
            id="memo"
            value={memo}
            onChange={(event) => setMemo(event.target.value)}
            placeholder="간단한 메모를 남겨보세요"
            rows={2}
            className="resize-none rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="photo" className="text-sm text-ink-soft">
            사진 (1장)
          </label>

          {photo ? (
            <div className="flex items-center gap-3">
              <img src={photo} alt="첨부한 사진 미리보기" className="h-20 w-20 rounded-lg object-cover" />
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="inline-flex items-center gap-1 rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink-soft hover:bg-surface-soft"
              >
                <X className="h-3.5 w-3.5" />
                사진 제거
              </button>
            </div>
          ) : (
            <label
              htmlFor="photo"
              className="flex w-fit cursor-pointer items-center gap-1.5 rounded-lg border border-dashed border-line px-3 py-2 text-sm text-ink-soft hover:border-accent hover:text-accent"
            >
              <ImagePlus className="h-4 w-4" />
              {isProcessingPhoto ? "처리 중..." : "사진 선택"}
            </label>
          )}

          <input
            id="photo"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            disabled={isProcessingPhoto}
            className="hidden"
          />
          {photoError && <p className="text-xs text-rose-500">{photoError}</p>}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent/90"
        >
          {isEditing ? "수정하기" : "등록하기"}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="rounded-lg border border-line px-5 py-2.5 text-sm font-medium text-ink-soft hover:bg-surface-soft"
          >
            취소
          </button>
        )}
      </div>
    </form>
  );
}

export default BucketForm;
