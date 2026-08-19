# 문장 도서관

Supabase(PostgreSQL)와 순수 HTML/CSS/JavaScript로 만든 도서관 서비스입니다.
일반 이용자 화면과 직원 운영 화면이 분리되어 있으며, 실제 데이터 추가·조회·수정·삭제와 테이블 관계를 코드 작성 과정에서 확인할 수 있습니다.

## 주요 기능

### 일반 이용자

- 오늘의 문장과 분위기별 도서 추천
- 제목·저자·분류 검색
- 대출 가능 여부 확인
- 도서관 회원가입

### 운영 직원

- 직원 계정 로그인
- 도서·저자·분류 관리
- 회원 정보 관리
- 대출 및 반납 처리
- 연체 현황 확인

운영 화면은 Supabase Auth 로그인과 `staff_users` 허용 목록을 모두 통과해야 접근할 수 있습니다.

## 프로젝트 구조

```text
supabase/
  01_schema.sql                    테이블과 인덱스
  02_views.sql                     재고·연체·운영 통계 뷰
  03_policies.sql                  공개/직원 RLS 정책
  04_seed.sql                      샘플 데이터
  05_cleanup_and_constraints.sql   기존 중복 데이터 정리
  audit-remote.mjs                 원격 상태 읽기 전용 점검
web/
  index.html                       도서관 홈
  books.html                       공개 도서 검색
  members.html                     공개 회원가입
  login.html                       직원 로그인
  admin.html                       운영 센터
  manage-books.html                직원용 도서 관리
  manage-members.html              직원용 회원 관리
  authors.html                     직원용 저자 관리
  categories.html                  직원용 분류 관리
  loans.html                       직원용 대출·반납
  css/style.css
  js/
```

## 새 Supabase 프로젝트 설정

Supabase SQL Editor에서 다음 파일을 순서대로 실행합니다.

1. `01_schema.sql`
2. `02_views.sql`
3. `04_seed.sql`
4. 아래의 **직원 계정 등록**
5. `03_policies.sql`

## 기존 프로젝트 안전하게 업데이트

현재 데이터와 대출 기록을 보존하려면 다음 순서를 지킵니다.

1. Supabase Dashboard → Authentication → Users에서 직원 계정을 생성합니다.
2. `05_cleanup_and_constraints.sql`을 실행합니다.
3. `03_policies.sql` 상단의 테이블 생성 부분까지 포함하여 전체를 실행합니다.
4. 아래 SQL로 생성한 직원을 허용 목록에 넣습니다.

```sql
insert into public.staff_users (user_id, display_name)
select id, '도서관 관리자'
from auth.users
where email = '직원 이메일 주소'
on conflict (user_id) do update
set display_name = excluded.display_name;
```

5. `/login`에서 해당 계정으로 로그인합니다.

`05_cleanup_and_constraints.sql`은 다음 순서로 동작합니다.

- 표기만 다른 `컴퓨터/IT`, `경제/경영` 분류 통합
- 중복 저자의 도서 참조 이동
- 중복 도서의 대출 기록을 대표 도서로 이동
- 보유 권수와 활성 대출 수 보정
- 중복 행 삭제
- 저자명 및 제목+저자 중복 방지 인덱스 생성

## 접근 권한

- 공개 사용자: 저자·분류·도서 조회, 회원가입 신청
- 운영 직원: `staff_users`에 등록된 로그인 사용자만 전체 관리
- 회원 목록과 연체 상세: 공개 접근 차단
- 운영 계정 공개 가입: 제공하지 않음

Publishable Key는 브라우저에 노출되어도 되는 키이지만, 데이터 보호는 반드시 RLS 정책으로 수행해야 합니다.

## 로컬 실행

```bash
python -m http.server 5500 --directory web
```

브라우저에서 `http://localhost:5500`으로 접속합니다.

## 점검

JavaScript 문법 검사:

```bash
Get-ChildItem web/js/*.js | ForEach-Object { node --check $_.FullName }
```

현재 원격 DB의 중복과 익명 노출 상태 확인:

```bash
node supabase/audit-remote.mjs
```

`audit-remote.mjs`는 데이터를 변경하지 않습니다.
