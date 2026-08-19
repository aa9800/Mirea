-- ============================================================
-- 04_seed.sql
-- 관계형 DB 학습을 위한 풍부한 샘플 데이터
-- 여러 번 실행해도 저자/도서/회원이 중복되지 않도록 작성했습니다.
-- ============================================================

-- 저자: 이름을 기준으로 중복 방지
insert into authors (name, bio)
select v.name, v.bio
from (values
  ('한강', '인간의 존엄과 폭력을 섬세한 문장으로 탐구하는 한국 소설가'),
  ('김영하', '도시적 감수성과 날카로운 서사로 잘 알려진 한국 소설가'),
  ('정세랑', '다정한 상상력으로 오늘의 삶을 그리는 한국 소설가'),
  ('최은영', '관계의 미세한 감정을 깊이 들여다보는 한국 소설가'),
  ('이청준', '한국 현대문학을 대표하는 소설가'),
  ('무라카미 하루키', '현실과 비현실의 경계를 넘나드는 일본 소설가'),
  ('조지 오웰', '사회와 권력을 날카롭게 비판한 영국 작가'),
  ('유발 하라리', '인류의 역사와 미래를 연구하는 역사학자'),
  ('칼 세이건', '과학의 경이로움을 대중에게 전한 천문학자'),
  ('로버트 마틴', '소프트웨어 장인정신과 Clean Code의 저자'),
  ('마틴 파울러', '리팩터링과 소프트웨어 설계 분야의 권위자'),
  ('제임스 클리어', '습관과 행동 변화에 관해 쓰는 작가'),
  ('김초엽', '과학적 상상력과 인간적 온기를 결합하는 SF 작가'),
  ('애덤 그랜트', '조직심리학과 동기 부여를 연구하는 심리학자')
) as v(name, bio)
where not exists (select 1 from authors a where a.name = v.name);

insert into categories (name) values
  ('한국문학'), ('세계문학'), ('과학'), ('인문·사회'), ('컴퓨터·IT'),
  ('자기계발'), ('에세이'), ('SF'), ('경제·경영'), ('예술')
on conflict (name) do nothing;

-- 도서: ISBN을 자연키처럼 사용하여 저자/분류 ID를 이름으로 조회
insert into books (title, isbn, author_id, category_id, published_year, total_copies)
select v.title, v.isbn, a.id, c.id, v.year, v.copies
from (values
  ('소년이 온다', '9788936434120', '한강', '한국문학', 2014, 4),
  ('채식주의자', '9788936433598', '한강', '한국문학', 2007, 3),
  ('여행의 이유', '9788954655972', '김영하', '에세이', 2019, 3),
  ('살인자의 기억법', '9788954622035', '김영하', '한국문학', 2013, 2),
  ('피프티 피플', '9788936434243', '정세랑', '한국문학', 2016, 3),
  ('시선으로부터,', '9788954672214', '정세랑', '한국문학', 2020, 4),
  ('쇼코의 미소', '9788936434267', '최은영', '한국문학', 2016, 3),
  ('밝은 밤', '9788954681179', '최은영', '한국문학', 2021, 4),
  ('당신들의 천국', '9788936434090', '이청준', '한국문학', 1976, 2),
  ('노르웨이의 숲', '9788937463105', '무라카미 하루키', '세계문학', 1987, 4),
  ('해변의 카프카', '9788937463761', '무라카미 하루키', '세계문학', 2002, 3),
  ('1984', '9788937460777', '조지 오웰', '세계문학', 1949, 5),
  ('동물농장', '9788937460050', '조지 오웰', '세계문학', 1945, 4),
  ('사피엔스', '9788934972464', '유발 하라리', '인문·사회', 2015, 5),
  ('호모 데우스', '9788934977841', '유발 하라리', '인문·사회', 2017, 3),
  ('코스모스', '9788983711892', '칼 세이건', '과학', 2006, 4),
  ('창백한 푸른 점', '9788983719201', '칼 세이건', '과학', 2001, 2),
  ('Clean Code', '9780132350884', '로버트 마틴', '컴퓨터·IT', 2008, 4),
  ('클린 아키텍처', '9788966262472', '로버트 마틴', '컴퓨터·IT', 2019, 3),
  ('리팩터링', '9788966263508', '마틴 파울러', '컴퓨터·IT', 2020, 4),
  ('아주 작은 습관의 힘', '9788965965046', '제임스 클리어', '자기계발', 2019, 5),
  ('우리가 빛의 속도로 갈 수 없다면', '9789668571002', '김초엽', 'SF', 2019, 4),
  ('지구 끝의 온실', '9788954681154', '김초엽', 'SF', 2021, 3),
  ('오리지널스', '9788947540672', '애덤 그랜트', '경제·경영', 2016, 2)
) as v(title, isbn, author_name, category_name, year, copies)
join authors a on a.name = v.author_name
join categories c on c.name = v.category_name
on conflict (isbn) do nothing;

insert into members (name, email, phone, joined_at) values
  ('김민준', 'minjun@example.com', '010-1111-2201', current_date - 320),
  ('박서연', 'seoyeon@example.com', '010-2222-2202', current_date - 280),
  ('이도윤', 'doyun@example.com', '010-3333-2203', current_date - 240),
  ('최지우', 'jiwoo@example.com', '010-4444-2204', current_date - 190),
  ('정하준', 'hajun@example.com', '010-5555-2205', current_date - 150),
  ('윤서아', 'seoa@example.com', '010-6666-2206', current_date - 120),
  ('강예준', 'yejun@example.com', '010-7777-2207', current_date - 90),
  ('한수빈', 'subin@example.com', '010-8888-2208', current_date - 65),
  ('오지호', 'jiho@example.com', '010-9999-2209', current_date - 45),
  ('송다은', 'daeun@example.com', '010-1212-2210', current_date - 25),
  ('임현우', 'hyunwoo@example.com', '010-3434-2211', current_date - 12),
  ('배유나', 'yuna@example.com', '010-5656-2212', current_date - 3)
on conflict (email) do nothing;

-- 대출 이력: 정상 대출, 연체, 반납 완료를 모두 확인할 수 있음
insert into loans (book_id, member_id, loan_date, due_date, return_date)
select b.id, m.id, v.loan_date, v.due_date, v.return_date
from (values
  ('9788936434120', 'minjun@example.com', current_date-28, current_date-14, null::date),
  ('9788937463105', 'seoyeon@example.com', current_date-20, current_date-6, null::date),
  ('9780132350884', 'doyun@example.com', current_date-8, current_date+6, null::date),
  ('9788934972464', 'jiwoo@example.com', current_date-5, current_date+9, null::date),
  ('9788983711892', 'hajun@example.com', current_date-3, current_date+11, null::date),
  ('9788954681154', 'seoa@example.com', current_date-2, current_date+12, null::date),
  ('9788937460777', 'yejun@example.com', current_date-40, current_date-26, current_date-25),
  ('9788965965046', 'subin@example.com', current_date-33, current_date-19, current_date-20),
  ('9788954672214', 'jiho@example.com', current_date-25, current_date-11, current_date-9),
  ('9788966263508', 'daeun@example.com', current_date-18, current_date-4, current_date-4),
  ('9789668571002', 'hyunwoo@example.com', current_date-15, current_date-1, current_date-2),
  ('9788937460050', 'yuna@example.com', current_date-1, current_date+13, null::date)
) as v(isbn, email, loan_date, due_date, return_date)
join books b on b.isbn = v.isbn
join members m on m.email = v.email
where not exists (
  select 1 from loans l
  where l.book_id = b.id and l.member_id = m.id and l.loan_date = v.loan_date
);
