-- ============================================================
-- 01_schema.sql
-- 도서관 대출 관리 시스템 - 테이블 정의
-- Supabase Dashboard > SQL Editor 에서 순서대로 실행하세요.
-- ============================================================

-- 저자
create table if not exists authors (
  id bigint generated always as identity primary key,
  name text not null,
  bio text,
  created_at timestamptz not null default now()
);

-- 분류(카테고리)
create table if not exists categories (
  id bigint generated always as identity primary key,
  name text not null unique,
  created_at timestamptz not null default now()
);

-- 도서
create table if not exists books (
  id bigint generated always as identity primary key,
  title text not null,
  isbn text unique,
  author_id bigint references authors(id) on delete set null,
  category_id bigint references categories(id) on delete set null,
  published_year int,
  total_copies int not null default 1 check (total_copies >= 0),
  created_at timestamptz not null default now()
);

-- 회원
create table if not exists members (
  id bigint generated always as identity primary key,
  name text not null,
  email text not null unique,
  phone text,
  joined_at date not null default current_date
);

-- 대출
create table if not exists loans (
  id bigint generated always as identity primary key,
  book_id bigint not null references books(id) on delete cascade,
  member_id bigint not null references members(id) on delete cascade,
  loan_date date not null default current_date,
  due_date date not null,
  return_date date,
  created_at timestamptz not null default now(),
  constraint due_after_loan check (due_date >= loan_date),
  constraint return_after_loan check (return_date is null or return_date >= loan_date)
);

-- 운영자 허용 목록 (Supabase Auth 사용자와 연결)
create table if not exists staff_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now()
);

-- 자주 조회하는 컬럼에 인덱스
create index if not exists idx_books_author on books(author_id);
create index if not exists idx_books_category on books(category_id);
create index if not exists idx_loans_book on loans(book_id);
create index if not exists idx_loans_member on loans(member_id);
create index if not exists idx_loans_open on loans(book_id) where return_date is null;
create unique index if not exists uq_authors_name_normalized on authors (lower(btrim(name)));
create unique index if not exists uq_books_title_author_normalized
  on books (lower(btrim(title)), coalesce(author_id, 0));
