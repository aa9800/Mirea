-- 문장 도서관 접근 정책
-- 공개 사용자는 도서 정보를 조회하고 회원가입을 신청할 수 있습니다.
-- 로그인한 운영자만 관리 데이터의 추가·수정·삭제가 가능합니다.

create table if not exists staff_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now()
);

alter table authors enable row level security;
alter table categories enable row level security;
alter table books enable row level security;
alter table members enable row level security;
alter table loans enable row level security;
alter table staff_users enable row level security;

drop policy if exists "anon full access - authors" on authors;
drop policy if exists "anon full access - categories" on categories;
drop policy if exists "anon full access - books" on books;
drop policy if exists "anon full access - members" on members;
drop policy if exists "anon full access - loans" on loans;

drop policy if exists "public read authors" on authors;
drop policy if exists "public read categories" on categories;
drop policy if exists "public read books" on books;
drop policy if exists "public join members" on members;
drop policy if exists "staff manage authors" on authors;
drop policy if exists "staff manage categories" on categories;
drop policy if exists "staff manage books" on books;
drop policy if exists "staff manage members" on members;
drop policy if exists "staff manage loans" on loans;
drop policy if exists "staff read own profile" on staff_users;

create policy "public read authors" on authors for select to anon, authenticated using (true);
create policy "public read categories" on categories for select to anon, authenticated using (true);
create policy "public read books" on books for select to anon, authenticated using (true);
create policy "public join members" on members for insert to anon with check (true);

create policy "staff read own profile" on staff_users
  for select to authenticated using (user_id = auth.uid());

create policy "staff manage authors" on authors for all to authenticated
  using (exists (select 1 from staff_users s where s.user_id = auth.uid()))
  with check (exists (select 1 from staff_users s where s.user_id = auth.uid()));
create policy "staff manage categories" on categories for all to authenticated
  using (exists (select 1 from staff_users s where s.user_id = auth.uid()))
  with check (exists (select 1 from staff_users s where s.user_id = auth.uid()));
create policy "staff manage books" on books for all to authenticated
  using (exists (select 1 from staff_users s where s.user_id = auth.uid()))
  with check (exists (select 1 from staff_users s where s.user_id = auth.uid()));
create policy "staff manage members" on members for all to authenticated
  using (exists (select 1 from staff_users s where s.user_id = auth.uid()))
  with check (exists (select 1 from staff_users s where s.user_id = auth.uid()));
create policy "staff manage loans" on loans for all to authenticated
  using (exists (select 1 from staff_users s where s.user_id = auth.uid()))
  with check (exists (select 1 from staff_users s where s.user_id = auth.uid()));

grant select on book_availability, dashboard_stats to anon, authenticated;
revoke all on overdue_loans from anon;
grant select on overdue_loans to authenticated;
grant select on staff_users to authenticated;
