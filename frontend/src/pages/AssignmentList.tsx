import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchAssignments, fetchSubjects } from '../api/client';
import type { Assignment, SubjectSummary } from '../api/types';
import AssignmentCard from '../components/AssignmentCard';
import SearchBar from '../components/SearchBar';
import SubjectFilter from '../components/SubjectFilter';

export default function AssignmentList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<Assignment[]>([]);
  const [subjects, setSubjects] = useState<SubjectSummary[]>([]);
  const [q, setQ] = useState('');
  const [subject, setSubject] = useState(() => searchParams.get('subject') ?? '');
  const [favoriteOnly, setFavoriteOnly] = useState(() => searchParams.get('favorite') === 'true');

  // 과목/즐겨찾기 필터가 바뀌면 주소창 쿼리도 함께 갱신해서, 대시보드→목록 이동 링크를
  // 공유/새로고침해도 유지되게 한다.
  useEffect(() => {
    const next: Record<string, string> = {};
    if (subject) next.subject = subject;
    if (favoriteOnly) next.favorite = 'true';
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject, favoriteOnly]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubjects()
      .then(setSubjects)
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const handle = setTimeout(() => {
      fetchAssignments({ q, subject, favorite: favoriteOnly })
        .then((res) => {
          setItems(res);
          setError(null);
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }, 200);
    return () => clearTimeout(handle);
  }, [q, subject, favoriteOnly]);

  return (
    <div className="assignment-list">
      <header className="page-heading">
        <div><span className="eyebrow">LIBRARY</span><h1>전체 학습 기록</h1><p>지금까지 쌓아온 과제와 프로젝트를 찾아보세요.</p></div>
        <span className="page-heading__count">{items.length}<small>개의 기록</small></span>
      </header>

      <div className="filters">
        <SearchBar value={q} onChange={setQ} />
        <SubjectFilter subjects={subjects} value={subject} onChange={setSubject} />
        <label className="favorite-filter">
          <input type="checkbox" checked={favoriteOnly} onChange={(e) => setFavoriteOnly(e.target.checked)} />
          즐겨찾기만
        </label>
      </div>

      {loading && <p className="muted">불러오는 중...</p>}
      {error && <p className="error-text">{error}</p>}
      {!loading && !error && items.length === 0 && <p className="empty">조건에 맞는 과제가 없어요.</p>}

      <div className="assignment-grid">
        {items.map((a) => (
          <AssignmentCard key={a.id} assignment={a} />
        ))}
      </div>
    </div>
  );
}
