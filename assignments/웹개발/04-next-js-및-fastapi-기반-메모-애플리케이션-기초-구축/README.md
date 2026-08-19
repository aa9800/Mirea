# Next.js 및 FastAPI 기반 메모 애플리케이션 기초 구축

- 과목: 웹개발
- 날짜: 2026-08-19
- 태그: next.js, fastapi, typescript, python, sqlite, tailwindcss

## 설명

본 프로젝트는 Next.js App Router를 활용한 프론트엔드 환경과 FastAPI 및 SQLite 기반의 파이썬 백엔드 코드로 구성되어 있습니다. 프론트엔드 측면에서는 TypeScript와 Tailwind CSS v4, ESLint를 적용하여 초기 웹 프로젝트 설정을 갖추고 레이아웃 및 메인 페이지를 정의하였습니다. 백엔드 측면에서는 FastAPI를 사용한 인메모리 메모 CRUD API 예제와 sqlite3 모듈을 활용한 데이터베이스 연동 기초 실습 코드가 포함되어 있습니다. 풀스택 메모 애플리케이션 구축을 위한 프론트엔드 스타터 템플릿과 백엔드 데이터 처리 실습을 종합적으로 다룹니다.

## 원본 파일

업로드한 프로젝트의 원본 파일 22개가 폴더 구조 그대로 [source/](./source/)에 보관되어 있습니다.

- [.gitignore](./source/.gitignore)
- [AGENTS.md](./source/AGENTS.md)
- [app/favicon.ico](./source/app/favicon.ico)
- [app/globals.css](./source/app/globals.css)
- [app/layout.tsx](./source/app/layout.tsx)
- [app/page.tsx](./source/app/page.tsx)
- [CLAUDE.md](./source/CLAUDE.md)
- [eslint.config.mjs](./source/eslint.config.mjs)
- [main.py](./source/main.py)
- [memos.db](./source/memos.db)
- [next-env.d.ts](./source/next-env.d.ts)
- [next.config.ts](./source/next.config.ts)
- [package.json](./source/package.json)
- [postcss.config.mjs](./source/postcss.config.mjs)
- [public/file.svg](./source/public/file.svg)
- [public/globe.svg](./source/public/globe.svg)
- [public/next.svg](./source/public/next.svg)
- [public/vercel.svg](./source/public/vercel.svg)
- [public/window.svg](./source/public/window.svg)
- [README.md](./source/README.md)
- [sqlite_demo.py](./source/sqlite_demo.py)
- [tsconfig.json](./source/tsconfig.json)

## 코드

<details>
<summary><strong>eslint.config.mjs</strong> — Next.js 및 TypeScript 프로젝트 규칙과 무시할 파일 경로를 설정한 ESLint 구성 파일입니다.</summary>

```javascript
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
```

</details>

<details>
<summary><strong>main.py</strong> — FastAPI와 Pydantic 모델을 사용하여 메모 목록 조회 및 추가 기능을 제공하는 간단한 백엔드 API 서버 파일입니다.</summary>

```python
from datetime import datetime

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


# 메모 생성 요청 시 들어오는 데이터 양식
class MemoCreate(BaseModel):
    content: str


# 서버에 저장되는 메모 (id, 생성 시각 포함)
class Memo(BaseModel):
    id: int
    content: str
    created_at: datetime


# 메모 저장소 (서버 껐다 켜면 초기화되는 임시 저장소)
memos: list[Memo] = []
next_id = 1


@app.get("/")
def root():
    return "안녕하세요"


# 메모 목록 조회
@app.get("/memos")
def get_memos():
    return memos


# 메모 저장
@app.post("/memos")
def create_memo(memo: MemoCreate):
    global next_id
    new_memo = Memo(id=next_id, content=memo.content, created_at=datetime.now())
    memos.append(new_memo)
    next_id += 1
    return new_memo
```

</details>

<details>
<summary><strong>next-env.d.ts</strong> — Next.js 프로젝트에서 생성되는 TypeScript 타입 선언 참조 파일입니다.</summary>

```typescript
/// <reference types="next" />
/// <reference types="next/image-types/global" />
import "./.next/dev/types/routes.d.ts";
import "./.next/dev/types/root-params.d.ts";

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.
```

</details>

<details>
<summary><strong>next.config.ts</strong> — Next.js 애플리케이션의 세부 환경을 구성하는 TypeScript 설정 파일입니다.</summary>

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
```

</details>

<details>
<summary><strong>package.json</strong> — Next.js, React, Tailwind CSS 등 프로젝트 의존성 패키지와 실행 스크립트 정보를 담고 있는 파일입니다.</summary>

```json
{
  "name": "my-memo2",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "next": "16.3.1",
    "react": "19.2.8",
    "react-dom": "19.2.8"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.3.1",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

</details>

<details>
<summary><strong>postcss.config.mjs</strong> — Tailwind CSS 플러그인 사용을 위해 설정된 PostCSS 구성 파일입니다.</summary>

```javascript
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

</details>

<details>
<summary><strong>sqlite_demo.py</strong> — SQLite3 데이터베이스 파일에 연동하여 메모 테이블을 생성하고 데이터를 데이터베이스에 입력 및 조회하는 데모 스크립트입니다.</summary>

```python
import sqlite3

# DB 파일에 연결 (없으면 자동 생성됨)
conn = sqlite3.connect("memos.db")
cursor = conn.cursor()

# memos 표 생성 (이미 있으면 건너뜀)
cursor.execute("""
    CREATE TABLE IF NOT EXISTS memos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL
    )
""")

# 메모 두 개 삽입
cursor.executemany(
    "INSERT INTO memos (content) VALUES (?)",
    [
        ("첫 번째 메모입니다.",),
        ("두 번째 메모입니다.",),
    ],
)
conn.commit()

# 저장된 메모 전체 조회
cursor.execute("SELECT id, content FROM memos")
rows = cursor.fetchall()

print("저장된 메모 목록:")
for row in rows:
    print(f"- id={row[0]}, content={row[1]}")

conn.close()
```

</details>

<details>
<summary><strong>tsconfig.json</strong> — TypeScript 컴파일러 옵션 및 경로 별칭, 포함/제외 경로를 정의한 설정 파일입니다.</summary>

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ],
  "exclude": ["node_modules"]
}
```

</details>

<details>
<summary><strong>app/globals.css</strong> — Tailwind CSS 가져오기 및 라이트/다크 모드에 따른 기본 테마 변수를 정의한 전역 스타일시트입니다.</summary>

```css
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: Arial, Helvetica, sans-serif;
}
```

</details>

<details>
<summary><strong>app/layout.tsx</strong> — Geist 폰트 설정 및 전역 스타일을 적용하는 Next.js App Router의 최상위 루트 레이아웃 파일입니다.</summary>

```typescript
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
```

</details>

<details>
<summary><strong>app/page.tsx</strong> — Next.js 애플리케이션 접속 시 첫 화면에 나타나는 기본 랜딩 메인 페이지 컴포넌트입니다.</summary>

```typescript
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert h-5 w-[100px]"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            To get started, edit the{" "}
            <code className="rounded bg-black/[.06] px-1.5 py-0.5 font-mono text-[0.9em] dark:bg-white/[.08]">
              page.tsx
            </code>{" "}
            file.
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Looking for a starting point or more instructions? Head over to{" "}
            <a
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Templates
            </a>{" "}
            or the{" "}
            <a
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Learning
            </a>{" "}
            center.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert h-[14px] w-4"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={14}
            />
            Deploy Now
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main>
    </div>
  );
}
```

</details>

## 코드 파일

- [eslint.config.mjs](./code/1787121440436-690977508.mjs)
- [main.py](./code/1787121440436-673536293.py)
- [next-env.d.ts](./code/1787121440437-121019007.ts)
- [next.config.ts](./code/1787121440438-725442176.ts)
- [package.json](./code/1787121440439-525994078.json)
- [postcss.config.mjs](./code/1787121440440-243397713.mjs)
- [sqlite_demo.py](./code/1787121440440-879285973.py)
- [tsconfig.json](./code/1787121440441-500587269.json)
- [globals.css](./code/1787121440442-198979298.css)
- [layout.tsx](./code/1787121440443-991615094.tsx)
- [page.tsx](./code/1787121440444-306759418.tsx)

## 이미지

![file.svg](./images/1787121440427-692323508.svg) (대표)
![globe.svg](./images/1787121440427-989305904.svg)
![next.svg](./images/1787121440428-774979536.svg)
![vercel.svg](./images/1787121440429-855357752.svg)
![window.svg](./images/1787121440430-618814172.svg)
![favicon.ico](./images/1787121440431-739629266.ico)

## 실행 결과

```
저장된 메모 목록:
- id=1, content=첫 번째 메모입니다.
- id=2, content=두 번째 메모입니다.
```

## 첨부파일

- [.gitignore](./attachments/1787121440432-550006114)
- [AGENTS.md](./attachments/1787121440432-219397669.md)
- [CLAUDE.md](./attachments/1787121440433-35552590.md)
- [memos.db](./attachments/1787121440434-190189124.db)
- [README.md](./attachments/1787121440435-951968883.md)

## 배운 점

Next.js App Router의 기본 구조 및 타입스크립트 환경 설정을 이해하고, FastAPI 및 SQLite3를 활용한 기본적인 메모 데이터 처리 API 구현 방법을 배울 수 있습니다.

## 어려웠던 점

Next.js 16 및 React 19와 같은 최신 라이브러리 버전의 설정 방식과 파이썬 백엔드 API 연동 구조를 함께 파악하는 과정이 생소할 수 있습니다.

---
_Study Archive에서 자동 생성됨 · 마지막 수정: 2026-08-19T06:37:20.466Z_