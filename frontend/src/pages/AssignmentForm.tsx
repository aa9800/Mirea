import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createAssignment, updateAssignment, fetchAssignment, fileUrl, analyzeContent, captureScreenshot } from '../api/client';
import type { Assignment, CodeBlock, FileRef } from '../api/types';
import TagInput from '../components/TagInput';

interface Props {
  mode: 'create' | 'edit';
}

const CODE_LANGUAGE_OPTIONS = [
  { value: '', label: '일반 텍스트' },
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'java', label: 'Java' },
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'bash', label: 'Bash' },
  { value: 'json', label: 'JSON' },
  { value: 'sql', label: 'SQL' },
];

// 폴더를 통째로 넣었을 때 파일 확장자로 어디에 담을지 정한다 — 결정적으로 정할 수
// 있는 건(이미지/코드) AI에게 묻지 않고 바로 분류한다.
const IMAGE_EXT = /\.(png|jpe?g|gif|bmp|ico|webp|svg)$/i;
const CODE_EXT_LANGUAGE: Record<string, string> = {
  py: 'python',
  js: 'javascript',
  jsx: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  java: 'java',
  c: 'c',
  h: 'c',
  cpp: 'cpp',
  cc: 'cpp',
  cxx: 'cpp',
  hpp: 'cpp',
  html: 'html',
  htm: 'html',
  css: 'css',
  scss: 'css',
  sh: 'bash',
  bash: 'bash',
  json: 'json',
  sql: 'sql',
};
// 코드 블록으로는 안 넣지만, 내용을 읽어서 AI 분석 참고 자료로는 쓸 수 있는 파일들.
const TEXT_ONLY_EXT = /\.(md|txt|csv|ya?ml|xml|log|ini|cfg|env)$/i;
const SKIP_DIR =
  /(^|[/\\])(node_modules|\.git|dist|build|__pycache__|\.ipynb_checkpoints|\.claude|\.vscode|\.idea)([/\\]|$)/i;
// 의존성 버전 해시만 잔뜩 든 락파일 — 몇십~몇백 KB짜리 순수 노이즈라 코드 블록은커녕
// 첨부로도 의미가 없어서 폴더 분석에서 통째로 건너뛴다.
const LOCKFILE_NAMES = new Set(['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lockb', 'composer.lock']);
const MAX_FOLDER_FILES = 60;
const MAX_TEXT_READ_SIZE = 300_000;

function extOf(filename: string): string {
  const m = filename.toLowerCase().match(/\.([a-z0-9]+)$/);
  return m ? m[1] : '';
}

function relPath(f: File): string {
  return (f as File & { webkitRelativePath?: string }).webkitRelativePath || f.name;
}

function base64ToFile(base64: string, mime: string, filename: string): File {
  const byteChars = atob(base64.replace(/\s/g, ''));
  const byteArray = new Uint8Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) byteArray[i] = byteChars.charCodeAt(i);
  return new File([byteArray], filename, { type: mime });
}

// .ipynb(주피터 노트북)는 JSON이라 그대로 코드 블록에 넣으면 못 알아보게 되니 직접 분해한다.
// - code 셀 → 코드 블록 하나로 합침, markdown 셀 → AI 분석 참고 자료
// - 실행 결과로 찍힌 텍스트(stdout 등) → "실행 결과" 필드 초안 (실제로 실행된 값이라 AI 추정보다 정확)
// - 실행 결과로 찍힌 이미지(plot 등, 노트북 안에 base64로 저장돼 있음) → 이미지로 추출
function extractNotebook(
  jsonText: string,
  baseName: string,
): { code: string; language: string; markdown: string; outputText: string; outputImages: File[] } | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nb: any = JSON.parse(jsonText);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cells: any[] = Array.isArray(nb.cells) ? nb.cells : [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const joinSource = (s: any) => (Array.isArray(s) ? s.join('') : String(s || ''));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const codeCells = cells.filter((c: any) => c.cell_type === 'code');
    const code = codeCells
      .map((c) => joinSource(c.source))
      .filter((s: string) => s.trim())
      .join('\n\n');
    const markdown = cells
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((c: any) => c.cell_type === 'markdown')
      .map((c) => joinSource(c.source))
      .filter((s: string) => s.trim())
      .join('\n\n');

    const outputTexts: string[] = [];
    const outputImages: File[] = [];
    let imgIndex = 0;
    for (const cell of codeCells) {
      for (const out of cell.outputs || []) {
        if (out.output_type === 'stream' && out.text) {
          outputTexts.push(joinSource(out.text));
        } else if (out.output_type === 'error') {
          outputTexts.push(`[에러] ${out.ename}: ${out.evalue}`);
        } else if ((out.output_type === 'execute_result' || out.output_type === 'display_data') && out.data) {
          const png = out.data['image/png'];
          const jpeg = out.data['image/jpeg'];
          if (png) {
            outputImages.push(base64ToFile(png, 'image/png', `${baseName}-output-${++imgIndex}.png`));
          } else if (jpeg) {
            outputImages.push(base64ToFile(jpeg, 'image/jpeg', `${baseName}-output-${++imgIndex}.jpg`));
          } else if (out.data['text/plain']) {
            outputTexts.push(joinSource(out.data['text/plain']));
          }
        }
      }
    }

    if (!code.trim() && !markdown.trim() && outputImages.length === 0 && outputTexts.length === 0) return null;

    const rawLanguage: string = nb.metadata?.language_info?.name || nb.metadata?.kernelspec?.language || 'python';
    const language = CODE_LANGUAGE_OPTIONS.some((opt) => opt.value === rawLanguage) ? rawLanguage : 'python';

    return {
      code: code.trim(),
      language,
      markdown: markdown.trim(),
      outputText: outputTexts.join('\n').trim().slice(0, 4000),
      outputImages,
    };
  } catch {
    return null;
  }
}

export default function AssignmentForm({ mode }: Props) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [codeBlocks, setCodeBlocks] = useState<CodeBlock[]>([{ language: '', code: '' }]);
  const [learnings, setLearnings] = useState('');
  const [difficulties, setDifficulties] = useState('');
  const [executionResult, setExecutionResult] = useState('');
  const [favorite, setFavorite] = useState(false);

  const [existingImages, setExistingImages] = useState<FileRef[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<FileRef[]>([]);
  const [existingCodeFiles, setExistingCodeFiles] = useState<FileRef[]>([]);
  const [existingExecutionImages, setExistingExecutionImages] = useState<FileRef[]>([]);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [removeImages, setRemoveImages] = useState<string[]>([]);
  const [removeAttachments, setRemoveAttachments] = useState<string[]>([]);
  const [removeCodeFiles, setRemoveCodeFiles] = useState<string[]>([]);
  const [removeExecutionImages, setRemoveExecutionImages] = useState<string[]>([]);

  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [isDraggingImages, setIsDraggingImages] = useState(false);
  const [newAttachments, setNewAttachments] = useState<File[]>([]);
  const [newCodeFiles, setNewCodeFiles] = useState<File[]>([]);
  const [newExecutionImages, setNewExecutionImages] = useState<File[]>([]);
  const [newExecutionImagePreviews, setNewExecutionImagePreviews] = useState<string[]>([]);

  const [assignmentId, setAssignmentId] = useState<string | null>(null);
  const [subjectSlug, setSubjectSlug] = useState('');
  const [leaf, setLeaf] = useState('');
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiNotice, setAiNotice] = useState<string | null>(null);

  const [screenshotPath, setScreenshotPath] = useState('');
  const [screenshotLoading, setScreenshotLoading] = useState(false);
  const [screenshotError, setScreenshotError] = useState<string | null>(null);
  const [screenshotNotice, setScreenshotNotice] = useState<string | null>(null);

  useEffect(() => {
    if (mode !== 'edit' || !id) return;
    // 다른 과제의 수정 화면으로 바로 넘어오는 경우(예: 브라우저 뒤로가기)에도
    // 이전 편집 중이던 새 파일/삭제 표시가 남지 않도록 초기화한다.
    setNewImages([]);
    setNewAttachments([]);
    setNewCodeFiles([]);
    setNewExecutionImages([]);
    setRemoveImages([]);
    setRemoveAttachments([]);
    setRemoveCodeFiles([]);
    setRemoveExecutionImages([]);
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
        setCodeBlocks(a.codeBlocks.length > 0 ? a.codeBlocks : [{ language: '', code: '' }]);
        setLearnings(a.learnings);
        setDifficulties(a.difficulties);
        setExecutionResult(a.executionResult);
        setFavorite(a.favorite);
        setExistingImages(a.images);
        setExistingAttachments(a.attachments);
        setExistingCodeFiles(a.codeFiles);
        setExistingExecutionImages(a.executionResultImages);
        setThumbnail(a.thumbnail);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [mode, id]);

  function toggleRemove(list: string[], setList: (v: string[]) => void, storedName: string) {
    setList(list.includes(storedName) ? list.filter((s) => s !== storedName) : [...list, storedName]);
  }

  // 코드 블록 추가/수정/삭제 — 과제 하나에 언어가 다른 코드가 여러 개 있을 수 있다.
  function addCodeBlock(block: CodeBlock = { language: '', code: '' }) {
    setCodeBlocks((prev) => [...prev, block]);
  }
  function updateCodeBlock(index: number, patch: Partial<CodeBlock>) {
    setCodeBlocks((prev) => prev.map((b, i) => (i === index ? { ...b, ...patch } : b)));
  }
  function removeCodeBlock(index: number) {
    setCodeBlocks((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  }

  const folderInputRef = useRef<HTMLInputElement>(null);

  // AI 제안 결과를 폼에 반영한다. 비어있는 필드만 채우고, 태그는 기존 것에
  // 이어붙인다 — 자동 저장은 하지 않고, 사용자가 그대로 확인/수정한 뒤 직접
  // 저장해야 반영된다.
  function applySuggestion(suggestion: {
    title: string;
    subject: string;
    description: string;
    codeLanguage: string;
    tags: string[];
    learnings: string;
    difficulties: string;
    executionResult: string;
  }) {
    if (!title.trim()) setTitle(suggestion.title);
    if (!subject.trim()) setSubject(suggestion.subject);
    if (!description.trim()) setDescription(suggestion.description);
    if (!learnings.trim() && suggestion.learnings) setLearnings(suggestion.learnings);
    if (!difficulties.trim() && suggestion.difficulties) setDifficulties(suggestion.difficulties);
    if (!executionResult.trim() && suggestion.executionResult) setExecutionResult(suggestion.executionResult);
    // 코드 블록이 하나뿐이고 아직 언어 미지정이면 그 블록에 제안된 언어를 채워준다
    // (블록이 여럿이면 어느 것에 붙여야 할지 알 수 없어 건드리지 않는다).
    if (suggestion.codeLanguage) {
      setCodeBlocks((prev) =>
        prev.length === 1 && !prev[0].language ? [{ ...prev[0], language: suggestion.codeLanguage }] : prev,
      );
    }
    if (suggestion.tags.length > 0) {
      setTags((prev) => {
        const merged = [...prev];
        for (const t of suggestion.tags) {
          if (!merged.includes(t)) merged.push(t);
        }
        return merged;
      });
    }
  }

  // 붙여넣은 코드(또는 선택한 코드 파일 하나)를 AI로 분석한다 — 코드 블록 중 내용이
  // 있는 첫 블록을 쓰고, 없으면 방금 고른 코드 파일 하나를 읽어서 쓴다.
  async function handleAiAssist() {
    setAiError(null);
    setAiNotice(null);

    const firstNonEmpty = codeBlocks.find((b) => b.code.trim());
    let sourceContent = firstNonEmpty?.code.trim() ?? '';
    let sourceFilename: string | undefined;

    if (!sourceContent && newCodeFiles.length > 0) {
      try {
        sourceContent = await newCodeFiles[0].text();
        sourceFilename = newCodeFiles[0].name;
      } catch {
        // 텍스트로 못 읽으면 아래 빈 값 체크에서 안내 메시지로 처리된다.
      }
    }

    if (!sourceContent) {
      setAiError('먼저 코드를 붙여넣거나 코드 파일을 선택해주세요.');
      return;
    }

    setAiLoading(true);
    try {
      const suggestion = await analyzeContent({ content: sourceContent, filename: sourceFilename });
      applySuggestion(suggestion);
    } catch (err) {
      setAiError((err as Error).message);
    } finally {
      setAiLoading(false);
    }
  }

  // 폴더를 선택하면: 이미지는 이미지 칸에, 코드로 보이는 파일은 코드 블록(언어까지
  // 자동 지정) + 코드 파일 첨부 양쪽에, 그 외 파일은 첨부파일에 자동으로 넣는다.
  // 읽을 수 있는 텍스트 내용은 모아서 한 번에 AI로 제목/설명/태그 등을 제안받는다.
  // node_modules/.git 같은 폴더는 건너뛰고, 파일이 너무 많으면 일부만 처리한다.
  async function handleAiAssistFolder(fileList: FileList) {
    setAiError(null);
    setAiNotice(null);

    const all = Array.from(fileList).filter(
      (f) => !SKIP_DIR.test(relPath(f)) && !LOCKFILE_NAMES.has(f.name) && f.size > 0,
    );
    if (all.length === 0) {
      setAiError('폴더에서 파일을 찾지 못했습니다.');
      return;
    }

    const picked = all.slice(0, MAX_FOLDER_FILES);
    const truncated = all.length - picked.length;

    const newImageFiles: File[] = [];
    const outputImageFiles: File[] = [];
    const capturedOutputTexts: string[] = [];
    const newCode: CodeBlock[] = [];
    const newCodeFileList: File[] = [];
    const newAttachmentFiles: File[] = [];
    const textForAi: { name: string; content: string }[] = [];

    setAiLoading(true);
    try {
      for (const f of picked) {
        const rel = relPath(f);

        if (IMAGE_EXT.test(f.name)) {
          newImageFiles.push(f);
          continue;
        }

        if (extOf(f.name) === 'ipynb') {
          newCodeFileList.push(f);
          if (f.size < MAX_TEXT_READ_SIZE) {
            try {
              const raw = await f.text();
              const nb = extractNotebook(raw, f.name.replace(/\.ipynb$/i, ''));
              if (nb) {
                if (nb.code) newCode.push({ language: nb.language, code: nb.code, filename: rel });
                textForAi.push({ name: rel, content: [nb.markdown, nb.code].filter(Boolean).join('\n\n') });
                if (nb.outputText) capturedOutputTexts.push(nb.outputText);
                if (nb.outputImages.length) outputImageFiles.push(...nb.outputImages);
              }
            } catch {
              // JSON 파싱 실패 등 — 코드 블록은 못 만들어도 파일 첨부는 그대로 된다.
            }
          }
          continue;
        }

        const language = CODE_EXT_LANGUAGE[extOf(f.name)];
        if (language) {
          newCodeFileList.push(f);
          if (f.size < MAX_TEXT_READ_SIZE) {
            try {
              const text = await f.text();
              newCode.push({ language, code: text, filename: rel });
              textForAi.push({ name: rel, content: text });
            } catch {
              // 텍스트로 못 읽으면 코드 블록은 못 만들어도 파일 첨부는 그대로 된다.
            }
          }
          continue;
        }

        // 코드도 이미지도 아닌 파일 — 첨부로 남기고, 문서류 텍스트면 AI 참고 자료로만 쓴다.
        newAttachmentFiles.push(f);
        if (TEXT_ONLY_EXT.test(f.name) && f.size < MAX_TEXT_READ_SIZE) {
          try {
            const text = await f.text();
            textForAi.push({ name: rel, content: text });
          } catch {
            // 무시 — 첨부로만 남는다.
          }
        }
      }

      if (newImageFiles.length) setNewImages((prev) => [...prev, ...newImageFiles]);
      // 노트북에서 뽑은 실행 결과 이미지(plot 등)는 일반 이미지 갤러리가 아니라
      // "실행 결과" 전용 슬롯으로 들어간다 — 실제로 그 코드를 실행한 결과물이니까.
      if (outputImageFiles.length) setNewExecutionImages((prev) => [...prev, ...outputImageFiles]);
      if (newCodeFileList.length) setNewCodeFiles((prev) => [...prev, ...newCodeFileList]);
      if (newAttachmentFiles.length) setNewAttachments((prev) => [...prev, ...newAttachmentFiles]);
      if (newCode.length) {
        // 기본으로 있던 빈 코드 블록 하나는 폴더에서 찾은 코드로 대체한다.
        setCodeBlocks((prev) => (prev.length === 1 && !prev[0].code.trim() ? newCode : [...prev, ...newCode]));
      }

      if (textForAi.length > 0) {
        const suggestion = await analyzeContent({ files: textForAi });
        applySuggestion(suggestion);
        // 파일별 설명을 파일명으로 매칭해서 해당 코드 블록에 붙인다 (설명이 아직 없는 블록만).
        if (suggestion.fileDescriptions?.length) {
          const byFilename = new Map(suggestion.fileDescriptions.map((d) => [d.filename, d.description]));
          setCodeBlocks((prev) =>
            prev.map((b) =>
              !b.description && b.filename && byFilename.has(b.filename)
                ? { ...b, description: byFilename.get(b.filename) }
                : b,
            ),
          );
        }
      }
      // 노트북에 실제로 찍혀있던 실행 결과 텍스트는 AI 추정보다 정확하니, 비어있으면 그걸로 채운다
      // (AI가 먼저 추정값을 채웠어도 여기서 실제 값으로 덮어쓴다).
      if (capturedOutputTexts.length > 0 && !executionResult.trim()) {
        setExecutionResult(capturedOutputTexts.join('\n---\n').slice(0, 4000));
      }

      const notes: string[] = [];
      if (truncated > 0) notes.push(`파일이 많아 ${picked.length}개만 처리하고 ${truncated}개는 건너뛰었어요.`);
      if (textForAi.length === 0) notes.push('분석할 텍스트 내용을 찾지 못해 파일만 첨부했어요.');
      if (outputImageFiles.length > 0) notes.push(`노트북 실행 결과 이미지 ${outputImageFiles.length}개를 "실행 결과"에 추가했어요.`);
      if (notes.length) setAiNotice(notes.join(' '));
    } catch (err) {
      setAiError((err as Error).message);
    } finally {
      setAiLoading(false);
    }
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

  // 실행 결과 이미지도 동일하게 미리보기 URL을 관리한다.
  useEffect(() => {
    const urls = newExecutionImages.map((f) => URL.createObjectURL(f));
    setNewExecutionImagePreviews(urls);
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [newExecutionImages]);

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

  function removeNewExecutionImage(index: number) {
    setNewExecutionImages((prev) => prev.filter((_, i) => i !== index));
  }

  // 로컬 프로젝트 폴더를 실제로 실행(npm install/run dev)해서 화면을 스크린샷 찍어온다.
  // 노트북과 달리 일반 소스코드 폴더에는 "실행하면 이렇게 보인다"는 이미지가 어디에도
  // 저장돼있지 않아서, 직접 실행해서 찍는 방법밖에 없다 — 그래서 시간이 꽤 걸릴 수 있다
  // (의존성 설치 + 서버 기동 + 촬영). 브라우저는 폴더 선택으로 절대 경로를 안 주기 때문에
  // 이 기능만 예외적으로 경로를 직접 입력받는다.
  async function handleCaptureScreenshot() {
    if (!screenshotPath.trim()) {
      setScreenshotError('프로젝트 폴더의 전체 경로를 입력해주세요 (예: C:\\Users\\me\\my-app).');
      return;
    }
    setScreenshotError(null);
    setScreenshotNotice(null);
    setScreenshotLoading(true);
    try {
      const { images, failed } = await captureScreenshot(screenshotPath.trim());
      if (images.length === 0) {
        setScreenshotError('스크린샷을 하나도 찍지 못했습니다.');
        return;
      }
      const files = images.map(({ path: routePath, image }, i) => {
        const base64 = image.split(',')[1] ?? '';
        const safeName = routePath.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '') || 'root';
        return base64ToFile(base64, 'image/png', `screenshot-${safeName || i}-${Date.now()}.png`);
      });
      setNewExecutionImages((prev) => [...prev, ...files]);

      const notes: string[] = [`페이지 ${images.length}개 스크린샷 완료 (${images.map((i) => i.path).join(', ')}).`];
      if (failed.length > 0) {
        notes.push(`${failed.length}개는 촬영에 실패했어요 (${failed.map((f) => f.path).join(', ')}).`);
      }
      setScreenshotNotice(notes.join(' '));
    } catch (err) {
      setScreenshotError((err as Error).message);
    } finally {
      setScreenshotLoading(false);
    }
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
    fd.set('codeBlocks', JSON.stringify(codeBlocks.filter((b) => b.code.trim())));
    fd.set('learnings', learnings);
    fd.set('difficulties', difficulties);
    fd.set('executionResult', executionResult);
    fd.set('favorite', String(favorite));
    if (thumbnail) fd.set('thumbnail', thumbnail);
    if (removeImages.length) fd.set('removeImages', removeImages.join(','));
    if (removeAttachments.length) fd.set('removeAttachments', removeAttachments.join(','));
    if (removeCodeFiles.length) fd.set('removeCodeFiles', removeCodeFiles.join(','));
    if (removeExecutionImages.length) fd.set('removeExecutionResultImages', removeExecutionImages.join(','));
    newImages.forEach((f) => fd.append('images', f));
    newAttachments.forEach((f) => fd.append('attachments', f));
    newCodeFiles.forEach((f) => fd.append('codeFiles', f));
    newExecutionImages.forEach((f) => fd.append('executionResultImages', f));

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

      <div className="ai-assist">
        <button type="button" className="ai-assist__btn" onClick={handleAiAssist} disabled={aiLoading}>
          {aiLoading ? '분석 중...' : '✨ AI로 자동 채우기'}
        </button>
        <button
          type="button"
          className="ai-assist__btn"
          onClick={() => folderInputRef.current?.click()}
          disabled={aiLoading}
        >
          {aiLoading ? '분석 중...' : '📁 폴더로 분석'}
        </button>
        <input
          ref={folderInputRef}
          type="file"
          multiple
          hidden
          // webkitdirectory는 표준 React 타입에 없어 DOM 속성으로 직접 지정한다.
          {...({ webkitdirectory: 'true', directory: 'true' } as Record<string, string>)}
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) handleAiAssistFolder(e.target.files);
            e.target.value = '';
          }}
        />
        <span className="hint">
          코드를 붙여넣거나 코드 파일을 선택한 뒤 눌러보세요. 폴더를 통째로 넣으면 코드·이미지·첨부파일까지
          자동으로 정리하고, 빈칸도 최대한 채워줘요.
        </span>
        {aiNotice && <p className="hint">{aiNotice}</p>}
        {aiError && <p className="error-text">{aiError}</p>}
      </div>

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
        <label>코드 (붙여넣기, 여러 개 가능)</label>
        {codeBlocks.map((block, i) => (
          <div key={i} className="code-block-editor">
            <div className="form-row__label-line">
              <select
                className="code-language-select"
                value={block.language}
                onChange={(e) => updateCodeBlock(i, { language: e.target.value })}
              >
                {CODE_LANGUAGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {block.filename && <span className="hint">{block.filename}</span>}
              {codeBlocks.length > 1 && (
                <button type="button" className="code-block-editor__remove" onClick={() => removeCodeBlock(i)}>
                  ✕ 삭제
                </button>
              )}
            </div>
            <input
              className="code-block-editor__description"
              placeholder="이 코드에 대한 설명 (선택 — 폴더로 분석하면 자동으로 채워져요)"
              value={block.description ?? ''}
              onChange={(e) => updateCodeBlock(i, { description: e.target.value })}
            />
            <textarea
              rows={8}
              className="code-input"
              value={block.code}
              onChange={(e) => updateCodeBlock(i, { code: e.target.value })}
            />
          </div>
        ))}
        <button type="button" className="code-block-editor__add" onClick={() => addCodeBlock()}>
          + 코드 블록 추가
        </button>
      </div>

      <div className="form-row">
        <label>코드 파일 첨부 (선택)</label>
        <input
          type="file"
          multiple
          onChange={(e) => setNewCodeFiles((prev) => [...prev, ...Array.from(e.target.files ?? [])])}
        />
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
        {newCodeFiles.length > 0 && (
          <ul className="file-list">
            {newCodeFiles.map((f, i) => (
              <li key={i}>{f.name}</li>
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
        <input
          type="file"
          multiple
          onChange={(e) => setNewAttachments((prev) => [...prev, ...Array.from(e.target.files ?? [])])}
        />
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
        {newAttachments.length > 0 && (
          <ul className="file-list">
            {newAttachments.map((f, i) => (
              <li key={i}>{f.name}</li>
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

        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => {
            if (e.target.files) setNewExecutionImages((prev) => [...prev, ...Array.from(e.target.files ?? [])]);
            e.target.value = '';
          }}
        />
        <p className="hint">실행 결과 화면(그래프, 스크린샷 등)이 있다면 이미지로 첨부하세요. 폴더 분석 시 노트북 출력 이미지는 자동으로 여기 들어와요.</p>

        <div className="screenshot-capture">
          <input
            className="screenshot-capture__input"
            placeholder="또는 프로젝트 폴더 전체 경로 입력 (예: C:\Users\me\my-app)"
            value={screenshotPath}
            onChange={(e) => setScreenshotPath(e.target.value)}
            disabled={screenshotLoading}
          />
          <button type="button" onClick={handleCaptureScreenshot} disabled={screenshotLoading}>
            {screenshotLoading ? '실행 중... (설치+기동에 몇 분 걸릴 수 있어요)' : '📸 서버 실행 후 스크린샷'}
          </button>
        </div>
        <p className="hint">소스 코드에서 페이지 경로를 자동으로 찾아 각각 스크린샷 찍어요 (React Router / Next.js 기준, 못 찾으면 첫 화면만).</p>
        {screenshotNotice && <p className="hint">{screenshotNotice}</p>}
        {screenshotError && <p className="error-text">{screenshotError}</p>}

        {newExecutionImages.length > 0 && (
          <div className="image-preview-grid">
            {newExecutionImages.map((file, i) => (
              <div key={i} className="image-preview">
                <img src={newExecutionImagePreviews[i]} alt={file.name} />
                <button type="button" onClick={() => removeNewExecutionImage(i)} aria-label={`${file.name} 제거`}>
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {existingExecutionImages.length > 0 && (
          <ul className="file-list file-list--editable">
            {existingExecutionImages.map((f) => (
              <li key={f.storedName}>
                <img
                  src={fileUrl(subjectSlug, leaf, 'images', f.storedName)}
                  alt={f.filename}
                  className="thumb-preview"
                />
                <span>{f.filename}</span>
                <label className="inline-check">
                  <input
                    type="checkbox"
                    checked={removeExecutionImages.includes(f.storedName)}
                    onChange={() => toggleRemove(removeExecutionImages, setRemoveExecutionImages, f.storedName)}
                  />
                  삭제
                </label>
              </li>
            ))}
          </ul>
        )}
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
