import { Link } from 'react-router-dom';
import type { Assignment } from '../api/types';
import { fileUrl } from '../api/client';

// 대시보드의 "피드"용 컴팩트 한 줄 항목. 전체 과제 페이지의 큰 카드 그리드와
// 구분되도록 일부러 작고 조밀하게 — 훑어보기 용도라는 걸 시각적으로 드러낸다.
export default function AssignmentRow({ assignment }: { assignment: Assignment }) {
  const thumbUrl = assignment.thumbnail
    ? fileUrl(assignment.leaf, 'images', assignment.thumbnail)
    : null;

  return (
    <Link to={`/assignments/${assignment.id}`} className="assignment-row">
      <div className="assignment-row__thumb">
        {thumbUrl ? (
          <img src={thumbUrl} alt={assignment.title} loading="lazy" />
        ) : (
          <span>{assignment.subject.slice(0, 1)}</span>
        )}
      </div>
      <div className="assignment-row__body">
        <div className="assignment-row__top">
          <span className="assignment-row__subject">{assignment.subject}</span>
          <span className="assignment-row__date">{assignment.date}</span>
        </div>
        <div className="assignment-row__title">
          {assignment.favorite && <span className="assignment-row__favorite">★</span>}
          {assignment.title}
        </div>
        {assignment.tags.length > 0 && (
          <div className="assignment-row__tags">
            {assignment.tags.slice(0, 4).map((t) => (
              <span key={t} className="tag-chip tag-chip--readonly">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
