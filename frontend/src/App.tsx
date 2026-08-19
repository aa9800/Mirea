import { Routes, Route, Link, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AssignmentList from './pages/AssignmentList';
import AssignmentDetail from './pages/AssignmentDetail';
import AssignmentForm from './pages/AssignmentForm';

export default function App() {
  return (
    <div className="app">
      <header className="topbar">
        <Link to="/" className="brand">
          <span className="brand__mark">S</span>
          <span className="brand__copy">
            <strong>Study Archive</strong>
            <small>나만의 학습 기록</small>
          </span>
        </Link>
        <nav>
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
            대시보드
          </NavLink>
          <NavLink to="/assignments" className={({ isActive }) => (isActive ? 'active' : '')}>
            전체 과제
          </NavLink>
          <NavLink to="/assignments/new" className="new-btn">
            <span>+</span> 새 기록
          </NavLink>
        </nav>
      </header>
      <main className="content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/assignments" element={<AssignmentList />} />
          <Route path="/assignments/new" element={<AssignmentForm mode="create" />} />
          <Route path="/assignments/:id" element={<AssignmentDetail />} />
          <Route path="/assignments/:id/edit" element={<AssignmentForm mode="edit" />} />
        </Routes>
      </main>
    </div>
  );
}
