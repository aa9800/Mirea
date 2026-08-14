# Study Archive — 프로젝트 계획

## 1. 목적

내가 만든 과제(코드/이미지/문서)를 계속 업로드하고, 나중에 과목별·태그별로
다시 찾아보기 위한 **개인 학습 아카이브**다.

**아닌 것**: 제출 관리 시스템이 아니다. 미제출/제출완료/마감일 같은 개념은
존재하지 않는다. "저장 = 끝"이며, 저장과 동시에 GitHub에도 자동으로 백업된다.

## 2. 핵심 기능

- 과제 목록 (제목/설명/태그/코드/실행결과/배운점·어려운점 기반 검색, 과목별 필터, 즐겨찾기 필터)
- 과제 상세 보기 (제목/과목/날짜/설명/태그/코드/이미지/첨부파일/실행결과/배운점·어려웠던점)
- 새 과제 등록
- 과제 수정 / 삭제
- 과제별 태그
- 배운 점 / 어려웠던 점 메모 (구조화된 두 개의 필드)
- 실행 결과 저장 및 표시 (텍스트 로그 + 스크린샷 이미지)
- 대표 이미지 썸네일 (목록/카드에 노출)
- 즐겨찾기 토글
- 대시보드: 최근 과제 + 과목별 현황(클릭 시 필터링) + 전체 탐색 진입점
- 저장(등록/수정/삭제) 시 자동으로 `README.md` 생성/업데이트 → `git add` → `git commit` → `git push`
- 과제 상세 화면에 해당 과제의 GitHub 링크, 마지막 업로드(동기화) 시간, 성공/실패 상태 표시

핵심 흐름: **과제 업로드 → 저장 → 상세 확인 → GitHub 자동 업로드**

### 이번 구현에는 넣지 않는 것

- 미제출 / 제출완료 / 마감일 관리
- 버전 기록 (수정 이력 diff/타임라인)
- 랜덤 복습 (스페이스드 리피티션 등)
- 통계 대시보드 (학습량 그래프 등)

→ 네 가지는 9장 "향후 확장"에 설계 방향만 남겨둔다.

## 3. 기술 스택

- **프론트엔드**: React + Vite + TypeScript + **Tailwind CSS** + `prism-react-renderer`(코드 문법 강조) (`frontend/`)
- **백엔드**: Node.js + Express (`backend/`, JavaScript)
- **저장소**: 파일 기반 (SQLite 같은 바이너리 DB 대신, 과제마다 JSON 메타데이터 +
  실제 파일을 폴더로 저장 → git diff/history가 사람이 읽을 수 있는 형태로 남음)
- **버전관리 자동화**: 백엔드에서 `child_process`로 git CLI 호출

> Tailwind 적용 방식: 컴포넌트 JSX의 클래스명(`assignment-card`, `btn` 등)은
> 의미 단위로 그대로 두고, `styles.css`에서 `@layer components` + `@apply`로
> Tailwind 유틸리티를 조합했다. 매 엘리먼트마다 유틸리티 클래스를 나열하는 대신
> 시맨틱한 이름을 유지하기 위한 선택으로, 필요하면 언제든 특정 컴포넌트만 인라인
> 유틸리티로 바꿀 수 있다.

## 4. 데이터 모델

과제 하나 = `assignments/<과목-슬러그>/<순번>-<제목-슬러그>/` 폴더 하나.

```
assignments/
  python/
    01-lotto/
      meta.json     # 앱이 읽고 쓰는 구조화된 데이터 (source of truth)
      README.md     # 사람이 GitHub에서 보기 좋은 요약 (저장할 때마다 자동 생성)
      code/          # 업로드한 코드 파일들
      images/        # 업로드한 이미지들
      attachments/    # 그 외 첨부파일
    02-vending-machine/
  html-css/
  javascript/
```

- 과목 폴더명은 사용자가 입력한 "과목" 문자열을 슬러그로 변환해 만든다
  (예: `Python` → `python`, `HTML/CSS` → `html-css`).
- 과제 폴더명은 해당 과목 폴더 안에서의 순번(`01-`, `02-`, ...) + 제목 슬러그다.
  순번은 그 과목 폴더 안에 이미 존재하는 폴더들의 최대 번호 + 1로 계산한다
  (중간 항목이 삭제되어도 번호가 꼬이지 않도록).
- 전역에서 과제를 가리키는 **id**는 `<과목-슬러그>-<순번>-<제목-슬러그>`
  (예: `python-01-lotto`)로, 슬래시가 없어 URL에 그대로 쓸 수 있다.
  id로 실제 폴더를 찾을 때는 `assignments/` 아래를 스캔해 `meta.json`의 id가
  일치하는 폴더를 찾는다 (개인 아카이브 규모라 별도 인덱스 없이도 충분히 빠르다).
- **수정 중 과목을 바꾸면 폴더 전체를 새 과목 폴더로 옮긴다** (`subjectSlug`가
  실제로 달라질 때만 — 대소문자 차이 등으로 슬러그가 같으면 이동하지 않는다).
  이동 시 새 과목 폴더 안에서 순번을 다시 매기고 `id`도 함께 바뀌므로, 클라이언트는
  PUT 응답의 `id`를 기준으로 상세 페이지 URL을 다시 잡는다. 옮기고 난 뒤 이전
  과목 폴더가 비면(다른 과제가 안 남아있으면) 함께 정리한다 — git은 빈 디렉터리를
  추적하지 않으므로 순전히 로컬 정리용이다. 삭제 시에도 동일하게 빈 과목 폴더를 정리한다.

### meta.json 스키마

```jsonc
{
  "id": "python-01-lotto",
  "subjectSlug": "python",         // 과목 폴더명
  "leaf": "01-lotto",                // 과목 폴더 안에서의 폴더명
  "title": "로또 번호 생성기",
  "subject": "Python",
  "date": "2026-08-14",             // 과제 관련 날짜 (제출기한 아님, 그냥 기록용)
  "description": "랜덤 로또 번호 생성 프로그램 구현",
  "tags": ["python", "random"],
  "codeBlocks": [                     // 붙여넣은 코드 스니펫들 (언어가 달라도 여러 개 가능)
    { "language": "python", "code": "import random\n...", "filename": "lotto.py" }
  ],
  "codeFiles": [
    { "filename": "solution.py", "storedName": "1699999999-abc.py", "size": 512 }
  ],
  "learnings": "random.sample로 중복 없는 추출을 할 수 있다는 걸 배웠다.",
  "difficulties": "번호 정렬 출력 부분에서 자잘한 실수가 있었다.",
  "executionResult": "실행 결과: [3, 11, 22, 27, 34, 41]",
  "executionResultImages": [                                // 실행 결과 화면(그래프 등). 물리적으로는
    { "filename": "plot.png", "storedName": "1699999999-xyz.png", "size": 15320 }  // images/ 폴더에 저장됨
  ],
  "favorite": true,
  "thumbnail": "1699999999-def.png",  // images 중 대표로 지정한 storedName (없으면 첫 이미지)
  "images": [
    { "filename": "result.png", "storedName": "1699999999-def.png", "size": 20481 }
  ],
  "attachments": [
    { "filename": "report.pdf", "storedName": "1699999999-ghi.pdf", "size": 102400 }
  ],
  "createdAt": "2026-08-14T01:20:00.000Z",
  "updatedAt": "2026-08-14T01:20:00.000Z",
  "github": {
    "status": "success",        // "success" | "failed" | "pending" | "not_synced"
    "url": "https://github.com/<user>/<repo>/tree/main/assignments/python/01-lotto",
    "lastSyncedAt": "2026-08-14T01:20:05.000Z",
    "lastError": null
  }
}
```

- `tags`: 자유 입력 문자열 배열. 검색 시 제목/설명/코드/실행결과/배운점·어려운점과 함께 매칭 대상이 된다.
- `codeBlocks`: `{ language, code, filename? }` 배열. `language`가 상세 화면 문법 강조 키(비어있으면
  일반 텍스트). `filename`은 폴더 분석으로 자동 채워진 경우 원본 파일명을 표시용으로 남긴 것.
  예전 버전(단일 `code`/`codeLanguage` 필드)으로 저장된 항목은 읽을 때 자동으로 이 배열 형태로 변환된다.
- `learnings` / `difficulties`: 배운 점 / 어려웠던 점을 구조화한 두 개의 필드.
- `executionResult`: 실행 로그/결과 요약 텍스트. 스크린샷은 `images`에 추가하고
  `thumbnail`로 지정하면 결과 화면을 대표 이미지로 보여줄 수 있다.
- `favorite`: 목록/대시보드에서 즐겨찾기 필터링에 사용.
- `README.md`는 이 meta.json 내용을 바탕으로 저장할 때마다 자동 생성/갱신되는
  **파생 파일**이다 — 앱이 직접 읽지는 않고, GitHub에서 사람이 보기 좋으라고 만든다.

## 5. 폴더 구조

```
과제웹/
  PROJECT_PLAN.md
  README.md
  .gitignore
  assignments/                  # 실제 과제 데이터 (git으로 관리되는 대상)
  backend/
    package.json
    .env.example              # GEMINI_API_KEY 등 로컬 환경변수 템플릿 (.env는 gitignore)
    src/
      server.js               # express 앱 진입점 (dotenv 로드)
      config.js                # 저장 경로, 포트 등 설정
      lib/
        store.js               # meta.json CRUD, 폴더/순번 생성, 파일 저장
        slug.js                # slug 생성
        readme.js               # meta.json → README.md 렌더링
        git.js                 # 실제 저장소 루트 탐지 + git add/commit/push 자동화
        ai.js                  # Gemini(기본)/Claude API로 등록 폼 메타데이터 초안 제안
      routes/
        assignments.js         # /api/assignments 라우트
        git.js                 # /api/git/status 라우트 (읽기 전용)
        ai.js                  # /api/ai/analyze 라우트
  frontend/
    index.html
    package.json
    vite.config.ts
    tsconfig.json
    tailwind.config.js
    postcss.config.js
    src/
      main.tsx
      App.tsx
      api/
        client.ts              # fetch 래퍼
        types.ts               # 공용 타입
      pages/
        Dashboard.tsx
        AssignmentList.tsx
        AssignmentDetail.tsx
        AssignmentForm.tsx      # 등록/수정 공용 폼
      components/
        AssignmentCard.tsx        # 전체 과제 페이지용 큰 썸네일 카드 (탐색용)
        AssignmentRow.tsx         # 대시보드 피드용 컴팩트 한 줄 항목 (훑어보기용)
        SubjectFilter.tsx
        GithubStatusBadge.tsx     # 성공/실패/미동기화 + 마지막 업로드 시간
        SearchBar.tsx
        TagInput.tsx              # 태그 추가/삭제 입력
        FavoriteToggle.tsx
        HighlightedCode.tsx       # 코드/실행결과 dark 프레임 + 문법 강조(prism-react-renderer)
        GitConnectionStatus.tsx   # 대시보드 상단 읽기 전용 Git 연결 상태 (입력 없음)
      styles.css                 # Tailwind base/components/utilities
```

## 6. 백엔드 API

| Method | Path                            | 설명                                  |
|--------|----------------------------------|---------------------------------------|
| GET    | /api/assignments                 | 목록 (query: `q`=제목/설명/태그/코드/실행결과/배운점·어려운점 검색, `subject`, `favorite=true`) |
| GET    | /api/assignments/recent          | 최근 N개 (대시보드용)                 |
| GET    | /api/assignments/subjects        | 과목 목록 + 과목별 개수                |
| GET    | /api/assignments/:id             | 상세                                   |
| POST   | /api/assignments                 | 신규 등록 (multipart/form-data)       |
| PUT    | /api/assignments/:id             | 수정 (multipart/form-data)            |
| PATCH  | /api/assignments/:id/favorite    | 즐겨찾기 토글 (git 동기화 트리거 안 함) |
| DELETE | /api/assignments/:id             | 삭제                                   |
| GET    | /files/:subjectSlug/:leaf/:type/:filename | 이미지/첨부파일/코드파일 정적 제공 (express.static) |
| GET    | /api/git/status                  | 읽기 전용 Git 연결 상태 (아래 참고)     |
| POST   | /api/ai/analyze                  | 코드/텍스트 분석 → 메타데이터 초안 제안 (저장 안 함, 아래 참고) |

> `/files`로 정적 제공하는 이유: 프론트엔드 라우트가 이미 `/assignments/*`
> (목록·상세·등록 화면)를 쓰고 있어서, 실제 업로드 파일 경로를 `/assignments`로
> 두면 Vite dev proxy가 SPA 페이지 요청까지 백엔드로 가로채 버린다. 그래서 파일은
> `/files`, 화면은 `/assignments`로 분리했다.

즐겨찾기 토글은 내용 변경이 아니라 git 커밋을 유발하지 않는 가벼운 로컬 상태
변경으로 취급한다 (매 클릭마다 push하지 않기 위함). 등록/수정/삭제만 git 동기화를
트리거한다.

등록/수정 시 서버는 (1) 파일 저장 → (2) `meta.json` 저장 → (3) `README.md` 생성/갱신
→ (4) 응답 반환(이 시점 `github.status`는 `"pending"`) → (5) 백그라운드로 git 동기화
실행 → (6) 결과(`success`/`failed`)를 `meta.json`의 `github` 필드에 반영, 순서로 동작한다.
프론트는 상세 화면에서 `github.status`가 `"pending"`이면 짧은 간격으로 다시 조회해
상태를 갱신한다.

### Git 연결 방식 — URL/토큰 입력 없음

이 앱은 GitHub URL이나 access token을 입력받는 화면을 두지 않는다. 대신 **이미
로컬에 설정된 git 저장소를 그대로 사용**한다:

1. 매 동기화(`runGitSync`)마다 `git rev-parse --show-toplevel`을 실행해
   실제 git 저장소 루트를 찾는다. 폴더 구조를 하드코딩으로 가정하지 않고,
   git이 실제로 인식하는 루트를 그대로 쓴다 — 저장소가 아니면 즉시
   `"이 프로젝트 폴더가 git 저장소가 아닙니다"`로 실패 처리하고 아무 git 명령도
   실행하지 않는다.
2. 찾아낸 루트를 이후 모든 `git add/commit/push` 호출의 `cwd`로 사용한다
   (`backend/src/lib/git.js`의 `run(cmd, args, cwd)`).
3. `origin` 리모트/브랜치는 `git remote get-url origin`, `git rev-parse
   --abbrev-ref HEAD`로 조회만 한다 — 값을 앱이 저장하거나 수정하지 않는다.
4. 인증은 전적으로 로컬 git(Credential Manager, SSH agent, `gh auth login` 등)에
   위임한다. 앱은 인증 정보를 다루지 않는다.
5. `GET /api/git/status`는 위 조회 결과(저장소 여부, 루트 경로, origin 존재 여부,
   원격 URL, 브랜치)를 그대로 반환하는 읽기 전용 엔드포인트다. 혹시 원격 URL에
   자격증명이 섞여 있어도(`https://user:token@host/...`) 응답 전에 제거한다.
   대시보드의 `GitConnectionStatus` 컴포넌트가 이걸 보여주기만 하며, 입력 필드는
   없다.

### AI 자동 채우기 — Gemini API(기본, 무료) / Claude API(대안), 저장은 항상 사용자 확인 후

새 과제 등록 폼에서 코드를 붙여넣거나 파일/폴더를 선택한 뒤 버튼을 누르면
`POST /api/ai/analyze`가 그 내용을 분석해 폼 빈칸을 최대한 채워준다
(`backend/src/lib/ai.js`, 구조화된 JSON 출력으로 결과를 강제).

- **입력 방식 두 가지**:
  - **✨ AI로 자동 채우기**: 붙여넣은 코드(또는 선택한 코드 파일 하나)를 분석.
  - **📁 폴더로 분석**: 폴더를 통째로 선택하면 프론트에서 파일 확장자를 보고
    결정적으로 분류한다 — 이미지 확장자는 이미지 칸으로, 코드 확장자는 "코드 파일
    첨부" + "코드 블록"(언어 자동 지정) 양쪽에, 그 외 문서류는 첨부파일로. 읽을 수
    있는 텍스트 내용은 모아서 AI 분석 한 번으로 나머지 빈칸을 채운다.
    (`node_modules`/`.git` 등은 건너뛰고, 파일이 너무 많으면 일부만 처리한 뒤 알림.)
- **제안 대상 필드**: 제목/과목/태그/설명/코드 언어(단일 붙여넣기일 때)에 더해
  **배운 점 · 어려웠던 점 · 실행 결과**까지 시도한다. 뒤 세 개는 실제로 실행해본
  게 아니라 코드를 읽고 추정한 값이라 근거가 부족하면 빈 문자열로 남는다 —
  사용자가 반드시 확인해야 한다.
- **코드는 여러 블록을 지원한다.** 과제 하나에 언어가 다른 코드가 여러 개 있을 수
  있어 `codeBlocks` 배열로 관리하고, 폼에서 "+ 코드 블록 추가"로 늘릴 수 있다.
- **자동 분리/병합은 하지 않는다.** 파일 하나(또는 폴더)를 여러 과제로 쪼개거나
  비슷한 내용을 합치는 건 오판 위험이 커서(조용히 아카이브가 엉망이 될 수 있음)
  이번 범위에 넣지 않았다 — 향후 확장 후보로만 남겨둔다.
- **제안은 초안일 뿐, 절대 자동 저장되지 않는다.** 프론트는 응답으로 받은 값 중
  **비어있는 필드만** 채우고(이미 입력한 내용은 덮어쓰지 않음), 태그는 기존 목록에
  이어붙인다. 사용자가 확인·수정한 뒤 직접 저장 버튼을 눌러야 실제로 반영된다.
- **API 키도 웹 UI에 입력받지 않는다.** GitHub 연동과 같은 원칙 — `backend/.env`에
  `GEMINI_API_KEY`(권장, [Google AI Studio](https://aistudio.google.com/apikey)에서
  무료 발급)를 설정해두면 그쪽을 우선 쓰고, 없으면 `ANTHROPIC_API_KEY`/
  `ant auth login` OAuth로 Claude API에 폴백한다(단, 이건 Anthropic Console
  종량제 크레딧이 필요하며 claude.ai 구독과는 별개 과금 — 실제 호출로 확인함).
  아무 것도 없으면 이 기능만 조용히 비활성화된다(다른 기능엔 영향 없음). 실제
  값을 담은 `.env`는 `.gitignore`에 있고, `.env.example`만 커밋된다.
  (참고: 로컬 `claude` CLI를 서브프로세스로 불러 Claude Code 구독 인증을 재사용하는
  방법도 검토했으나, Windows에서 `.cmd` 스크립트 spawn이 Node 보안 정책상 막혀
  있어 포기했다.)

## 7. 프론트엔드 화면

- **대시보드 (`/`)**: 탐색이 아니라 "훑어보기"가 목적 — 상단에 읽기 전용 Git 연결
  상태(`GitConnectionStatus`)를 보여주고, 전체 과제 페이지와 뚜렷이 구분되도록
  통계는 막대 위젯(전체 개수 + 과목별 비율 막대, 클릭 시 필터링된 전체 과제로
  이동), 목록은 조밀한 피드(행)로 표현한다. 최근 과제 피드 +
  즐겨찾기가 있을 때만 노출되는 ⭐ 즐겨찾기 피드로 구성
- **과제 목록 (`/assignments`)**: 제목/설명/태그/코드/메모 검색창 + 과목 필터 + 즐겨찾기 필터
  + 큰 썸네일 카드 그리드 (탐색용, URL 쿼리 `?subject=`/`?favorite=true`로 대시보드에서 필터 진입 가능)
- **과제 상세 (`/assignments/:id`)**: 메타 정보(제목/과목/날짜/태그), 코드 블록,
  이미지 갤러리(썸네일 강조), 첨부파일 다운로드, 실행 결과, 배운 점/어려웠던 점,
  즐겨찾기 토글, GitHub 링크 + 마지막 업로드 시간 + 성공/실패 배지, 수정/삭제 버튼
- **새 과제 등록 (`/assignments/new`)**, **수정 (`/assignments/:id/edit`)**:
  동일한 폼 컴포넌트 재사용 (태그 입력, 코드 언어 선택, 기존 이미지 중 대표 이미지 선택 포함)

## 8. Git 자동화 전제 조건

이 저장소(`과제웹/`)가 로컬 git 저장소로 초기화되어 있고 `origin` 리모트가
GitHub 저장소를 가리키고 있어야 자동 push가 동작한다. 아직 초기화되지 않았다면:

```bash
git init
git remote add origin <your-github-repo-url>
git branch -M main
git add -A
git commit -m "init"
git push -u origin main
```

GitHub 인증(예: `gh auth login` 또는 credential manager)은 사용자가 미리
설정해두어야 하며, 이 앱은 이미 인증된 git CLI를 그대로 호출만 한다.

## 9. 향후 확장 (이번 구현 범위 아님 — 설계 방향만)

- **버전 기록**: 과제를 수정할 때마다 git commit이 이미 하나씩 쌓이므로,
  `git log --follow -- assignments/<subject>/<leaf>` 결과를 파싱해 상세 화면에
  "수정 이력" 타임라인으로 보여주는 방식을 고려. `meta.json`에 별도 버전 배열을
  두지 않고 git 히스토리를 단일 진실 공급원으로 재사용하는 것이 핵심 아이디어.
- **랜덤 복습**: `/api/assignments/random` (또는 `?random=true`) 엔드포인트를 추가해
  과목/태그로 필터링한 뒤 무작위 1건을 반환. 프론트에 "오늘의 복습" 카드나 별도
  `/review` 페이지를 추가하는 형태로 확장 가능.
- **통계 대시보드**: `meta.json`을 스캔해 과목별/태그별/월별 등록 수, 즐겨찾기 비율
  등을 집계하는 `/api/stats` 엔드포인트 + 대시보드 내 차트 섹션으로 확장 가능.
- **과목별 학습 기록 / 코드 변경 이력**: 위 "버전 기록"과 같은 방식으로 git 히스토리를
  재사용해 과목 단위 커밋 로그를 모아 보여주는 형태로 확장 가능.

모든 확장 기능이 기존 파일 기반 저장 구조(`assignments/<subject>/<leaf>/meta.json`
+ git 히스토리)를 그대로 활용할 수 있도록 스키마를 설계해 두었으므로, 나중에
추가하더라도 데이터 마이그레이션이 필요 없다.
