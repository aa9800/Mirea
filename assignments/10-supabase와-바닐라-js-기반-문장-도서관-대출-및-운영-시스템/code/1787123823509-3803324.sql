-- ============================================================
-- 기존 데이터 정리 및 중복 방지 제약조건 (temp table 미사용 버전)
-- Supabase SQL Editor는 커넥션 풀링 때문에 TEMPORARY TABLE이 문장 사이에서
-- 사라질 수 있어, CTE(WITH)로 매번 다시 계산하는 방식으로 작성했습니다.
-- 각 문장은 독립적으로 안전하게 재실행 가능합니다 (idempotent).
-- ============================================================

-- 1. 표기만 다른 분류를 하나로 통합
insert into categories (name) values ('컴퓨터·IT'), ('경제·경영')
on conflict (name) do nothing;

update books
set category_id = (select id from categories where name = '컴퓨터·IT')
where category_id in (select id from categories where name in ('컴퓨터/IT', '컴퓨터 · IT'));

update books
set category_id = (select id from categories where name = '경제·경영')
where category_id in (select id from categories where name in ('경제/경영', '경제 · 경영'));

delete from categories where name in ('컴퓨터/IT', '컴퓨터 · IT', '경제/경영', '경제 · 경영');

-- 2. 이름이 같은 저자를 최신 행 하나로 통합
with merge_map as (
  select id as duplicate_id,
         max(id) over (partition by lower(btrim(name))) as keep_id
  from authors
)
update books b
set author_id = m.keep_id
from merge_map m
where b.author_id = m.duplicate_id and m.duplicate_id <> m.keep_id;

with merge_map as (
  select id as duplicate_id,
         max(id) over (partition by lower(btrim(name))) as keep_id
  from authors
)
delete from authors a
using merge_map m
where a.id = m.duplicate_id and m.duplicate_id <> m.keep_id;

-- 3. 제목과 저자가 같은 도서를 최신 행 하나로 통합
--    기존 대출은 대표 도서로 옮겨 기록을 보존합니다.
with merge_map as (
  select id as duplicate_id,
         max(id) over (partition by lower(btrim(title)), coalesce(author_id, 0)) as keep_id
  from books
)
update loans l
set book_id = m.keep_id
from merge_map m
where l.book_id = m.duplicate_id and m.duplicate_id <> m.keep_id;

-- 중복 행 중 가장 큰 보유 권수를 대표 행에 반영합니다.
with merge_map as (
  select id as duplicate_id,
         max(id) over (partition by lower(btrim(title)), coalesce(author_id, 0)) as keep_id
  from books
),
dup_stats as (
  select m.keep_id, max(b.total_copies) as max_copies
  from merge_map m
  join books b on b.id = m.duplicate_id
  group by m.keep_id
)
update books keep_book
set total_copies = greatest(
  dup_stats.max_copies,
  (select count(*)::int from loans l where l.book_id = keep_book.id and l.return_date is null)
)
from dup_stats
where keep_book.id = dup_stats.keep_id;

with merge_map as (
  select id as duplicate_id,
         max(id) over (partition by lower(btrim(title)), coalesce(author_id, 0)) as keep_id
  from books
)
delete from books b
using merge_map m
where b.id = m.duplicate_id and m.duplicate_id <> m.keep_id;

-- 4. 이후 같은 데이터가 다시 들어오지 않도록 DB에서 차단
create unique index if not exists uq_authors_name_normalized
  on authors (lower(btrim(name)));

create unique index if not exists uq_books_title_author_normalized
  on books (lower(btrim(title)), coalesce(author_id, 0));
