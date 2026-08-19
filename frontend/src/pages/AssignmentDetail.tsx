import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { fetchAssignment, fetchAssignments, deleteAssignment, toggleFavorite, fileUrl, sourceFileUrl } from '../api/client';
import type { Assignment } from '../api/types';
import GithubStatusBadge from '../components/GithubStatusBadge';
import FavoriteToggle from '../components/FavoriteToggle';
import HighlightedCode from '../components/HighlightedCode';
import AssignmentCard from '../components/AssignmentCard';
import Lightbox from '../components/Lightbox';

// 같은 과목이면 +2점, 겹치는 태그 하나당 +1점 — 별도 추천 엔진 없이 기존 데이터만으로
// "관련 있어 보이는" 순서를 매긴다. 점수가 0(과목도 다르고 겹치는 태그도 없음)이면 제외.
function relatedScore(candidate: Assignment, current: Assignment): number {
  let score = 0;
  if (candidate.subject === current.subject) score += 2;
  score += candidate.tags.filter((t) => current.tags.includes(t)).length;
  return score;
}

export default function AssignmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [related, setRelated] = useState<Assignment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  const load = useCallback(() => {
    if (!id) return;
    fetchAssignment(id).then(setAssignment).catch((err) => setError(err.message));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  // GitHub 동기화가 진행 중(pending)이면 잠시 후 다시 조회해서 상태를 갱신한다.
  useEffect(() => {
    if (assignment?.github.status !== 'pending') return;
    const t = setTimeout(load, 1500);
    return () => clearTimeout(t);
  }, [assignment, load]);

  // 관련 과제 — 같은 과목/겹치는 태그 기준 최대 3개, 현재 과제는 제외.
  useEffect(() => {
    if (!assignment) return;
    let cancelled = false;
    fetchAssignments({})
      .then((all) => {
        if (cancelled) return;
        const ranked = all
          .filter((a) => a.id !== assignment.id)
          .map((a) => ({ a, score: relatedScore(a, assignment) }))
          .filter((x) => x.score > 0)
          .sort((x, y) => y.score - x.score || (y.a.date || '').localeCompare(x.a.date || ''))
          .slice(0, 3)
          .map((x) => x.a);
        setRelated(ranked);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignment?.id, assignment?.subject, assignment?.tags.join(',')]);

  async function handleToggleFavorite() {
    if (!assignment) return;
    setBusy(true);
    try {
      setAssignment(await toggleFavorite(assignment.id));
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!assignment) return;
    if (!confirm('이 과제를 삭제할까요? 로컬 파일과 GitHub 저장소에서도 함께 제거됩니다.')) return;
    setBusy(true);
    try {
      await deleteAssignment(assignment.id);
      navigate('/assignments');
    } catch (err) {
      alert((err as Error).message);
      setBusy(false);
    }
  }

  if (error) return <p className="error-text">{error}</p>;
  if (!assignment) return <p className="muted">불러오는 중...</p>;

  return (
    <article className="assignment-detail">
      {/* 제목/과목/날짜/태그 — 개인 노트의 표지처럼 계층을 또렷하게 */}
      <header className="detail-header">
        <div className="detail-header__top">
          <div>
            <span className="detail-header__subject">{assignment.subject}</span>
            <h1 className="detail-header__title">{assignment.title}</h1>
            <div className="detail-header__date">{assignment.date}</div>
          </div>
          <div className="assignment-detail__actions">
            <FavoriteToggle active={assignment.favorite} onToggle={handleToggleFavorite} disabled={busy} />
            <Link to={`/assignments/${assignment.id}/edit`} className="btn">
              수정
            </Link>
            <button className="btn btn--danger" onClick={handleDelete} disabled={busy}>
              삭제
            </button>
          </div>
        </div>

        {assignment.tags.length > 0 && (
          <div className="detail-header__tags">
            {assignment.tags.map((t) => (
              <span key={t} className="tag-chip tag-chip--readonly">
                {t}
              </span>
            ))}
          </div>
        )}
      </header>

      <GithubStatusBadge github={assignment.github} />

      {/* 본문 — 카드로 나누지 않고 문서처럼 이어서 읽히도록 */}
      <div className="doc-flow">
        {assignment.description && (
          <section className="doc-section">
            <h2 className="doc-section__label">설명</h2>
            <p className="doc-section__body">{assignment.description}</p>
          </section>
        )}

        {(assignment.executionResult || assignment.executionResultImages.length > 0) && (
          <section className="doc-section">
            <h2 className="doc-section__label">실행 결과</h2>
            {assignment.executionResult && (
              <div className="code-frame">
                <span className="code-frame__tag">output</span>
                <pre className="code-block">{assignment.executionResult}</pre>
              </div>
            )}
            {assignment.executionResultImages.length > 0 && (
              <div className="image-gallery">
                {assignment.executionResultImages.map((img) => {
                  const src = fileUrl(assignment.leaf, 'images', img.storedName);
                  return (
                    <figure key={img.storedName}>
                      <img src={src} alt={img.filename} onClick={() => setLightbox({ src, alt: img.filename })} />
                      <figcaption>{img.filename}</figcaption>
                    </figure>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {assignment.codeBlocks.length > 0 && (
          <section className="doc-section">
            <h2 className="doc-section__label">코드</h2>
            {assignment.codeBlocks.map((block, i) => (
              <div key={i} className="code-block-item">
                {block.description && <p className="doc-section__body">{block.description}</p>}
                <HighlightedCode code={block.code} language={block.language} tagLabel={block.filename} />
              </div>
            ))}
          </section>
        )}

        {assignment.codeFiles.length > 0 && (
          <section className="doc-section">
            <h2 className="doc-section__label">코드 파일</h2>
            <ul className="file-list">
              {assignment.codeFiles.map((f) => (
                <li key={f.storedName}>
                  <a href={fileUrl(assignment.leaf, 'code', f.storedName)} download>
                    {f.filename}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {assignment.sourceFiles.length > 0 && (
          <section className="doc-section">
            <h2 className="doc-section__label">원본 파일</h2>
            <p className="doc-section__body">
              업로드한 프로젝트의 원본 파일 {assignment.sourceFiles.length}개가 폴더 구조 그대로 보존되어 있습니다.
            </p>
            <ul className="file-list">
              {[...assignment.sourceFiles]
                .sort((a, b) => a.path.localeCompare(b.path))
                .map((f) => (
                  <li key={f.path}>
                    <a href={sourceFileUrl(assignment.leaf, f.path)} download>
                      {f.path}
                    </a>
                  </li>
                ))}
            </ul>
          </section>
        )}

        {assignment.images.length > 0 && (
          <section className="doc-section">
            <h2 className="doc-section__label">이미지</h2>
            <div className="image-gallery">
              {assignment.images.map((img) => {
                const src = fileUrl(assignment.leaf, 'images', img.storedName);
                return (
                  <figure
                    key={img.storedName}
                    className={img.storedName === assignment.thumbnail ? 'is-thumbnail' : ''}
                  >
                    <img src={src} alt={img.filename} onClick={() => setLightbox({ src, alt: img.filename })} />
                    <figcaption>
                      {img.filename}
                      {img.storedName === assignment.thumbnail ? ' (대표)' : ''}
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          </section>
        )}

        {assignment.attachments.length > 0 && (
          <section className="doc-section">
            <h2 className="doc-section__label">첨부파일</h2>
            <ul className="file-list">
              {assignment.attachments.map((f) => (
                <li key={f.storedName}>
                  <a href={fileUrl(assignment.leaf, 'attachments', f.storedName)} download>
                    {f.filename}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {/* 배운 점 / 어려웠던 점 — 회고 노트처럼 은은하게 구분된 2열 */}
      {(assignment.learnings || assignment.difficulties) && (
        <section className="reflection-grid">
          {assignment.learnings && (
            <div className="reflection-card reflection-card--learnings">
              <h2>배운 점</h2>
              <p>{assignment.learnings}</p>
            </div>
          )}
          {assignment.difficulties && (
            <div className="reflection-card reflection-card--difficulties">
              <h2>어려웠던 점</h2>
              <p>{assignment.difficulties}</p>
            </div>
          )}
        </section>
      )}

      {/* 관련 과제 — 같은 과목/겹치는 태그 기준, 별도 추천 엔진 없이 기존 데이터만 이용 */}
      {related.length > 0 && (
        <section className="related-section">
          <h2 className="doc-section__label">관련 과제</h2>
          <div className="related-grid">
            {related.map((a) => (
              <AssignmentCard key={a.id} assignment={a} />
            ))}
          </div>
        </section>
      )}

      {lightbox && <Lightbox src={lightbox.src} alt={lightbox.alt} onClose={() => setLightbox(null)} />}
    </article>
  );
}
