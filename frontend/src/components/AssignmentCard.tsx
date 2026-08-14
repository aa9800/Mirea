import { Link } from 'react-router-dom';
import type { Assignment } from '../api/types';
import { fileUrl } from '../api/client';

export default function AssignmentCard({ assignment }: { assignment: Assignment }) {
  const thumbUrl = assignment.thumbnail
    ? fileUrl(assignment.subjectSlug, assignment.leaf, 'images', assignment.thumbnail)
    : null;

  return (
    <Link to={`/assignments/${assignment.id}`} className="assignment-card">
      <div className="assignment-card__thumb">
        {thumbUrl ? (
          <img src={thumbUrl} alt={assignment.title} loading="lazy" />
        ) : (
          <div className="assignment-card__thumb-placeholder">No Image</div>
        )}
        {assignment.favorite && <span className="assignment-card__favorite">★</span>}
      </div>
      <div className="assignment-card__body">
        <div className="assignment-card__subject">{assignment.subject}</div>
        <div className="assignment-card__title">{assignment.title}</div>
        <div className="assignment-card__date">{assignment.date}</div>
        {assignment.tags.length > 0 && (
          <div className="assignment-card__tags">
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
