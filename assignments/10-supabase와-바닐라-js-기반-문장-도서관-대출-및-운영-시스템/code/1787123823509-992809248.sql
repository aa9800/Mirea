-- ============================================================
-- 06_merge_fiction_categories.sql
-- 의미가 겹치는 분류를 최종 통합합니다.
--   인문·사회 -> 인문학
--   소설      -> 한국문학 / 세계문학 (저자 국적 기준으로 재배정)
-- ============================================================

-- 인문·사회 -> 인문학
update books
set category_id = (select id from categories where name = '인문학')
where category_id = (select id from categories where name = '인문·사회');

delete from categories where name = '인문·사회';

-- 소설 -> 한국문학 (한국 작가) / 세계문학 (그 외 나머지)
update books b
set category_id = (select id from categories where name = '한국문학')
where b.category_id = (select id from categories where name = '소설')
  and b.author_id in (select id from authors where name in ('정유정', '김영하', '한강', '박완서'));

update books b
set category_id = (select id from categories where name = '세계문학')
where b.category_id = (select id from categories where name = '소설');

delete from categories where name = '소설';
