import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAssignments, fetchRecent, fetchSubjects } from '../api/client';
import type { Assignment, SubjectSummary } from '../api/types';
import AssignmentRow from '../components/AssignmentRow';
import GitConnectionStatus from '../components/GitConnectionStatus';

export default function Dashboard() {
  const [recent, setRecent] = useState<Assignment[]>([]);
  const [favorites, setFavorites] = useState<Assignment[]>([]);
  const [subjects, setSubjects] = useState<SubjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchRecent(6), fetchSubjects(), fetchAssignments({ favorite: true })])
      .then(([r, s, f]) => {
        setRecent(r);
        setSubjects(s);
        setFavorites(f.slice(0, 5));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const total = subjects.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="dashboard">
      <p className="dashboard__intro">지금까지 기록한 학습 과제를 한눈에 확인해보세요.</p>

      <GitConnectionStatus />

      {/* 요약 위젯 — 전체 과제 페이지의 검색/필터 바와는 다른, "훑어보기용" 통계 영역 */}
      <section className="dashboard__stats">
        <Link to="/assignments" className="stat-total">
          <div className="stat-total__value">{total}</div>
          <div className="stat-total__label">전체 과제</div>
        </Link>
        {subjects.length > 0 && (
          <div className="subject-bars">
            {subjects.map((s) => (
              <Link
                to={`/assignments?subject=${encodeURIComponent(s.subject)}`}
                className="subject-bar"
                key={s.subject}
              >
                <div className="subject-bar__top">
                  <span className="subject-bar__name">{s.subject}</span>
                  <span className="subject-bar__count">{s.count}</span>
                </div>
                <div className="subject-bar__track">
                  <div
                    className="subject-bar__fill"
                    style={{ width: `${total ? (s.count / total) * 100 : 0}%` }}
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {error && <p className="error-text">{error}</p>}

      {/* 최근 과제 — 피드 형태로 훑어보기 (전체 과제 페이지는 카드 그리드로 탐색용) */}
      <section className="dashboard__feed">
        <div className="section-header">
          <h2>최근 과제</h2>
          <Link to="/assignments">전체 보기 →</Link>
        </div>

        {loading && <p className="muted">불러오는 중...</p>}
        {!loading && !error && recent.length === 0 && (
          <p className="empty">
            아직 등록된 과제가 없어요. <Link to="/assignments/new">첫 과제를 올려보세요!</Link>
          </p>
        )}

        {recent.length > 0 && (
          <div className="assignment-feed">
            {recent.map((a) => (
              <AssignmentRow key={a.id} assignment={a} />
            ))}
          </div>
        )}
      </section>

      {!loading && favorites.length > 0 && (
        <section className="dashboard__feed">
          <div className="section-header">
            <h2>⭐ 즐겨찾기</h2>
            <Link to="/assignments?favorite=true">전체 보기 →</Link>
          </div>

          <div className="assignment-feed">
            {favorites.map((a) => (
              <AssignmentRow key={a.id} assignment={a} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
