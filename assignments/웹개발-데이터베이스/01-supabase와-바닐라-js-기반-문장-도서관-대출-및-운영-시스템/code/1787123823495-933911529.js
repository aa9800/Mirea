import { supabase, showError, escapeHTML } from "./supabaseClient.js";

async function loadAdmin() {
  const [{ data: stats, error: statsError }, { data: overdue, error: overdueError }] = await Promise.all([
    supabase.from("dashboard_stats").select("*").single(),
    supabase.from("overdue_loans").select("*").order("days_overdue", { ascending: false }),
  ]);
  if (statsError || overdueError) { showError(`관리 데이터를 불러오지 못했습니다: ${(statsError || overdueError).message}`); return; }
  [stats.total_books, stats.total_copies, stats.total_members, stats.active_loans, stats.overdue_count].forEach((value, index) => {
    document.querySelectorAll("#admin-stats .num")[index].textContent = Number(value).toLocaleString("ko-KR");
  });
  const body = document.getElementById("overdue-body");
  body.innerHTML = overdue.length ? overdue.map((row) => `<tr><td><span class="book-title">${escapeHTML(row.book_title)}</span></td><td>${escapeHTML(row.member_name)}</td><td>${escapeHTML(row.member_email)}</td><td>${row.loan_date}</td><td>${row.due_date}</td><td><span class="badge danger">${row.days_overdue}일</span></td></tr>`).join("") : `<tr class="empty-row"><td colspan="6">연체 데이터가 없습니다.</td></tr>`;
}
loadAdmin();
