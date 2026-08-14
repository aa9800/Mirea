import type { SubjectSummary } from '../api/types';

interface Props {
  subjects: SubjectSummary[];
  value: string;
  onChange: (subject: string) => void;
}

export default function SubjectFilter({ subjects, value, onChange }: Props) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="subject-filter">
      <option value="">전체 과목</option>
      {subjects.map((s) => (
        <option key={s.subject} value={s.subject}>
          {s.subject} ({s.count})
        </option>
      ))}
    </select>
  );
}
