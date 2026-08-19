-- ============================================================
-- 02_views.sql
-- 도서 대여 가능 수량 / 연체 목록 뷰
-- ============================================================

-- 도서별 대여 가능 수량 (전체 보유 수 - 현재 대출 중인 수)
create or replace view book_availability as
select
  b.id as book_id,
  b.title,
  b.total_copies,
  count(l.id) filter (where l.return_date is null) as on_loan,
  b.total_copies - count(l.id) filter (where l.return_date is null) as available_copies
from books b
left join loans l on l.book_id = b.id
group by b.id, b.title, b.total_copies;

-- 연체 대출 목록 (반납 안 했는데 반납예정일이 지난 건)
create or replace view overdue_loans as
select
  l.id as loan_id,
  b.title as book_title,
  m.name as member_name,
  m.email as member_email,
  l.loan_date,
  l.due_date,
  current_date - l.due_date as days_overdue
from loans l
join books b on b.id = l.book_id
join members m on m.id = l.member_id
where l.return_date is null
  and l.due_date < current_date;

-- 대시보드용 요약 통계
create or replace view dashboard_stats as
select
  (select count(*) from books) as total_books,
  (select coalesce(sum(total_copies), 0) from books) as total_copies,
  (select count(*) from members) as total_members,
  (select count(*) from loans where return_date is null) as active_loans,
  (select count(*) from overdue_loans) as overdue_count;
