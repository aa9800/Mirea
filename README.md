# Study Archive

## 1. 프로젝트 개요

Study Archive는 내가 만든 학습 과제물을 계속 업로드하고,
나중에 다시 확인할 수 있도록 정리하는 개인 학습 아카이브 웹이다.

단순한 파일 보관소가 아니라
과제의 문제, 코드, 실행 결과, 이미지, 첨부파일, 배운 점을
한 곳에서 함께 확인할 수 있도록 한다.

또한 과제를 저장할 때 GitHub 저장소에도 자동으로 업로드하여
학습 결과물을 지속적으로 백업하고 기록한다.

---

## 2. 핵심 목표

1. 지금까지 만든 과제물을 한 곳에서 확인
2. 앞으로 새로운 과제물을 계속 추가
3. 과제별 코드, 이미지, 파일, 메모를 함께 보관
4. 과목과 태그를 이용해 쉽게 탐색
5. 저장한 과제물을 GitHub에도 자동 업로드
6. 장기적으로 개인 학습 포트폴리오로 활용

---

## 3. 핵심 기능

### 과제 업로드
- 제목 / 과목 / 작성일 / 과제 설명 / 코드 / 실행 결과
- 문제 이미지 / 첨부파일 / 태그 / 배운 점 / 어려웠던 점

### 과제 목록
- 전체 과제 보기 / 최근 과제 / 과목별 분류 / 태그 표시 / 대표 이미지 썸네일

### 과제 상세
- 문제 설명 / 코드 / 실행 결과 / 이미지 / 첨부파일
- 배운 점 / 어려웠던 점 / GitHub 링크 / 마지막 GitHub 업로드 시간

### 검색
- 제목 검색 / 설명 검색 / 태그 검색 / 과목 필터

### 즐겨찾기
- 중요한 과제 또는 다시 보고 싶은 과제 저장

### 수정 / 삭제
- 기존 과제 수정 / 과제 삭제

---

## 4. GitHub 자동 업로드

과제를 저장하면 다음 작업을 수행한다.

1. 과제 데이터를 로컬 프로젝트 폴더(`assignments/`)에 저장
2. 코드 파일 저장
3. 이미지 및 첨부파일 저장
4. 과제별 `README.md` 생성 또는 업데이트
5. `git add`
6. `git commit`
7. `git push`
8. 성공 또는 실패 결과를 웹에 표시

GitHub 토큰이나 인증 정보는 프론트엔드에 노출하지 않는다. 백엔드가 로컬에
이미 인증된 git CLI(`gh auth login` 또는 credential manager로 설정됨)를
그대로 호출만 한다.

---

## 5. 과제 폴더 구조

```
assignments/
├── python/
│   ├── 01-lotto/
│   │   ├── meta.json      # 앱이 읽는 구조화된 데이터
│   │   ├── README.md      # GitHub에서 보기 좋은 사람용 요약 (자동 생성)
│   │   ├── code/
│   │   ├── images/
│   │   └── attachments/
│   ├── 02-vending-machine/
│   └── 03-369/
├── html-css/
├── javascript/
└── etc/
```

과목 폴더명은 사용자가 입력한 "과목"을 슬러그로 변환해 만들고, 과제 폴더명은
해당 과목 안에서의 순번(`01-`, `02-`...) + 제목 슬러그로 만든다.

---

## 6. 메인 화면

```
Study Archive                              [+ 새 과제]

최근 과제
[카드] [카드] [카드] ...

과목
Python  HTML/CSS  JavaScript  기타       (클릭 시 해당 과목으로 필터링)

전체 과제
[카드] [카드] [카드] ...
```

과제 카드에는 대표 이미지, 제목, 과목, 작성일, 태그, 즐겨찾기 여부를 표시한다.

---

## 7. 추가 기능

이번 버전에 포함: 태그 · 배운 점 · 어려웠던 점 · 실행 결과 · 대표 이미지 ·
즐겨찾기 · 검색 · GitHub 링크 및 마지막 업로드 시간

추후 확장(설계만, 이번 구현 범위 아님): 과제 버전 기록 · 랜덤 복습 ·
학습 통계 · 과목별 학습 기록 · 코드 변경 이력

자세한 내용은 [PROJECT_PLAN.md](./PROJECT_PLAN.md) 참고.

---

## 8. 기술 스택

- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express
- **Storage**: 로컬 파일 시스템 (`assignments/` 폴더, meta.json 기반)
- **Version Control**: Git + GitHub (백엔드에서 자동 add/commit/push)

---

## 9. 실행 방법

### 0. (한 번만) GitHub 자동 업로드를 쓰려면 git 저장소로 초기화

```bash
git init
git remote add origin <your-github-repo-url>
git branch -M main
git add -A
git commit -m "init"
git push -u origin main
```

이 단계를 건너뛰면 과제 등록/수정/삭제는 정상 동작하지만, GitHub 동기화는
계속 "실패"로 표시된다.

### 1. 백엔드 실행

```bash
cd backend
npm install
npm start
```

`http://localhost:4000` 에서 API 서버가 실행된다.

### 2. 프론트엔드 실행 (새 터미널)

```bash
cd frontend
npm install
npm run dev
```

`http://localhost:5173` 접속. `/api`, `/files`(업로드된 이미지/코드/첨부파일) 요청은
자동으로 백엔드(4000번 포트)로 프록시된다.
