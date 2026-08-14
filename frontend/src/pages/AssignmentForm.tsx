import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createAssignment, updateAssignment, fetchAssignment, fileUrl } from '../api/client';
import type { Assignment, FileRef } from '../api/types';
import TagInput from '../components/TagInput';

interface Props {
  mode: 'create' | 'edit';
}

export default function AssignmentForm({ mode }: Props) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [code, setCode] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('');
  const [learnings, setLearnings] = useState('');
  const [difficulties, setDifficulties] = useState('');
  const [executionResult, setExecutionResult] = useState('');
  const [favorite, setFavorite] = useState(false);

  const [existingImages, setExistingImages] = useState<FileRef[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<FileRef[]>([]);
  const [existingCodeFiles, setExistingCodeFiles] = useState<FileRef[]>([]);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [removeImages, setRemoveImages] = useState<string[]>([]);
  const [removeAttachments, setRemoveAttachments] = useState<string[]>([]);
  const [removeCodeFiles, setRemoveCodeFiles] = useState<string[]>([]);

  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [isDraggingImages, setIsDraggingImages] = useState(false);
  const [newAttachments, setNewAttachments] = useState<File[]>([]);
  const [newCodeFiles, setNewCodeFiles] = useState<File[]>([]);

  const [assignmentId, setAssignmentId] = useState<string | null>(null);
  const [subjectSlug, setSubjectSlug] = useState('');
  const [leaf, setLeaf] = useState('');
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode !== 'edit' || !id) return;
    // 다른 과제의 수정 화면으로 바로 넘어오는 경우(예: 브라우저 뒤로가기)에도
    // 이전 편집 중이던 새 파일/삭제 표시가 남지 않도록 초기화한다.
    setNewImages([]);
    setNewAttachments([]);
    setNewCodeFiles([]);
    setRemoveImages([]);
    setRemoveAttachments([]);
    setRemoveCodeFiles([]);
    fetchAssignment(id)
      .then((a: Assignment) => {
        setAssignmentId(a.id);
        setSubjectSlug(a.subjectSlug);
        setLeaf(a.leaf);
        setTitle(a.title);
        setSubject(a.subject);
        setDate(a.date);
        setDescription(a.description);
        setTags(a.tags);
        setCode(a.code);
        setCodeLanguage(a.codeLanguage);
        setLearnings(a.learnings);
        setDifficulties(a.difficulties);
        setExecutionResult(a.executionResult);
        setFavorite(a.favorite);
        setExistingImages(a.images);
        setExistingAttachments(a.attachments);
        setExistingCodeFiles(a.codeFiles);
        setThumbnail(a.thumbnail);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [mode, id]);

  function toggleRemove(list: string[], setList: (v: string[]) => void, storedName: string) {
    setList(list.includes(storedName) ? list.filter((s) => s !== storedName) : [...list, storedName]);
  }

  // 새로 추가한 이미지들의 즉시 미리보기(object URL). newImages가 바뀔 때마다 다시 만들고
  // 이전 URL은 메모리 누수 방지를 위해 해제한다.
  useEffect(() => {
    const urls = newImages.map((f) => URL.createObjectURL(f));
    setNewImagePreviews(urls);
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [newImages]);

  // 파일 선택 / 드래그앤드롭 / 클립보드 붙여넣기 — 세 가지 경로 모두 여기로 모여
  // 기존 목록 뒤에 이어붙인다 (이미지가 아닌 파일은 조용히 무시).
  function addImageFiles(files: FileList | File[]) {
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (imageFiles.length === 0) return;
    setNewImages((prev) => [...prev, ...imageFiles]);
  }

  function removeNewImage(index: number) {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  }

  // Ctrl+V로 클립보드의 이미지를 붙여넣을 수 있도록, 폼이 떠 있는 동안 전역으로 감지한다.
  useEffect(() => {
    function handlePaste(e: ClipboardEvent) {
      if (!e.clipboardData) return;
      const files = Array.from(e.clipboardData.items)
        .filter((item) => item.kind === 'file' && item.type.startsWith('image/'))
        .map((item) => item.getAsFile())
        .filter((f): f is File => f !== null);
      if (files.length > 0) {
        e.preventDefault();
        addImageFiles(files);
      }
    }
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !subject.trim()) {
      setError('제목과 과목은 필수입니다.');
      return;
    }

    const fd = new FormData();
    fd.set('title', title);
    fd.set('subject', subject);
    fd.set('date', date);
    fd.set('description', description);
    fd.set('tags', tags.join(','));
    fd.set('code', code);
    fd.set('codeLanguage', codeLanguage);
    fd.set('learnings', learnings);
    fd.set('difficulties', difficulties);
    fd.set('executionResult', executionResult);
    fd.set('favorite', String(favorite));
    if (thumbnail) fd.set('thumbnail', thumbnail);
    if (removeImages.length) fd.set('removeImages', removeImages.join(','));
    if (removeAttachments.length) fd.set('removeAttachments', removeAttachments.join(','));
    if (removeCodeFiles.length) fd.set('removeCodeFiles', removeCodeFiles.join(','));
    newImages.forEach((f) => fd.append('images', f));
    newAttachments.forEach((f) => fd.append('attachments', f));
    newCodeFiles.forEach((f) => fd.append('codeFiles', f));

    setSaving(true);
    setError(null);
    try {
      const saved =
        mode === 'edit' && assignmentId ? await updateAssignment(assignmentId, fd) : await createAssignment(fd);
      navigate(`/assignments/${saved.id}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="muted">불러오는 중...</p>;

  return (
    <form className="assignment-form" onSubmit={handleSubmit}>
      <h2>{mode === 'edit' ? '과제 수정' : '새 과제 등록'}</h2>
      {error && <p className="error-text">{error}</p>}

      <div className="form-row">
        <label>제목 *</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>

      <div className="form-row form-row--split">
        <div>
          <label>과목 *</label>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} required />
        </div>
        <div>
          <label>날짜</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>

      <div className="form-row">
        <label>태그</label>
        <TagInput tags={tags} onChange={setTags} />
      </div>

      <div className="form-row">
        <label>설명</label>
        <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <div className="form-row">
        <div className="form-row__label-line">
          <label>코드 (붙여넣기)</label>
          <select
            className="code-language-select"
            value={codeLanguage}
            onChange={(e) => setCodeLanguage(e.target.value)}
          >
            <option value="">일반 텍스트</option>
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="java">Java</option>
            <option value="c">C</option>
            <option value="cpp">C++</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="bash">Bash</option>
            <option value="json">JSON</option>
            <option value="sql">SQL</option>
          </select>
        </div>
        <textarea rows={8} className="code-input" value={code} onChange={(e) => setCode(e.target.value)} />
      </div>

      <div className="form-row">
        <label>코드 파일 첨부 (선택)</label>
        <input type="file" multiple onChange={(e) => setNewCodeFiles(Array.from(e.target.files ?? []))} />
        {existingCodeFiles.length > 0 && (
          <ul className="file-list file-list--editable">
            {existingCodeFiles.map((f) => (
              <li key={f.storedName}>
                <a href={fileUrl(subjectSlug, leaf, 'code', f.storedName)} target="_blank" rel="noreferrer">
                  {f.filename}
                </a>
                <label className="inline-check">
                  <input
                    type="checkbox"
                    checked={removeCodeFiles.includes(f.storedName)}
                    onChange={() => toggleRemove(removeCodeFiles, setRemoveCodeFiles, f.storedName)}
                  />
                  삭제
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="form-row">
        <label>이미지</label>

        <div
          className={`dropzone ${isDraggingImages ? 'dropzone--active' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDraggingImages(true);
          }}
          onDragLeave={() => setIsDraggingImages(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDraggingImages(false);
            if (e.dataTransfer.files) addImageFiles(e.dataTransfer.files);
          }}
        >
          <input
            id="image-file-input"
            className="dropzone__input"
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => {
              if (e.target.files) addImageFiles(e.target.files);
              e.target.value = '';
            }}
          />
          <label htmlFor="image-file-input" className="dropzone__label">
            <span className="dropzone__label-main">이미지를 드래그하거나 클릭해서 선택하세요</span>
            <span className="dropzone__label-sub">Ctrl+V로 클립보드 이미지 붙여넣기도 가능해요</span>
          </label>
        </div>

        {newImages.length > 0 && (
          <div className="image-preview-grid">
            {newImages.map((file, i) => (
              <div key={i} className="image-preview">
                <img src={newImagePreviews[i]} alt={file.name} />
                <button type="button" onClick={() => removeNewImage(i)} aria-label={`${file.name} 제거`}>
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {existingImages.length > 0 && (
          <ul className="file-list file-list--editable">
            {existingImages.map((f) => (
              <li key={f.storedName}>
                <img
                  src={fileUrl(subjectSlug, leaf, 'images', f.storedName)}
                  alt={f.filename}
                  className="thumb-preview"
                />
                <span>{f.filename}</span>
                <label className="inline-check">
                  <input
                    type="radio"
                    name="thumbnail"
                    checked={thumbnail === f.storedName}
                    onChange={() => setThumbnail(f.storedName)}
                  />
                  대표 이미지
                </label>
                <label className="inline-check">
                  <input
                    type="checkbox"
                    checked={removeImages.includes(f.storedName)}
                    onChange={() => toggleRemove(removeImages, setRemoveImages, f.storedName)}
                  />
                  삭제
                </label>
              </li>
            ))}
          </ul>
        )}
        <p className="hint">새로 올린 이미지는 저장 후 상세 화면에서 대표 이미지로 지정할 수 있어요.</p>
      </div>

      <div className="form-row">
        <label>첨부파일</label>
        <input type="file" multiple onChange={(e) => setNewAttachments(Array.from(e.target.files ?? []))} />
        {existingAttachments.length > 0 && (
          <ul className="file-list file-list--editable">
            {existingAttachments.map((f) => (
              <li key={f.storedName}>
                <a href={fileUrl(subjectSlug, leaf, 'attachments', f.storedName)} target="_blank" rel="noreferrer">
                  {f.filename}
                </a>
                <label className="inline-check">
                  <input
                    type="checkbox"
                    checked={removeAttachments.includes(f.storedName)}
                    onChange={() => toggleRemove(removeAttachments, setRemoveAttachments, f.storedName)}
                  />
                  삭제
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="form-row">
        <label>실행 결과</label>
        <textarea
          rows={4}
          className="code-input"
          value={executionResult}
          onChange={(e) => setExecutionResult(e.target.value)}
          placeholder="실행 로그, 최종 출력, 스크린샷 설명 등"
        />
      </div>

      <div className="form-row form-row--split">
        <div>
          <label>배운 점</label>
          <textarea rows={3} value={learnings} onChange={(e) => setLearnings(e.target.value)} />
        </div>
        <div>
          <label>어려웠던 점</label>
          <textarea rows={3} value={difficulties} onChange={(e) => setDifficulties(e.target.value)} />
        </div>
      </div>

      <div className="form-row">
        <label className="inline-check">
          <input type="checkbox" checked={favorite} onChange={(e) => setFavorite(e.target.checked)} />
          즐겨찾기에 추가
        </label>
      </div>

      <button type="submit" disabled={saving}>
        {saving ? '저장 중...' : '저장 (GitHub 자동 업로드)'}
      </button>
    </form>
  );
}
