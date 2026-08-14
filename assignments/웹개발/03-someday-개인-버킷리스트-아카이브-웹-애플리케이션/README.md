# Someday - 개인 버킷리스트 아카이브 웹 애플리케이션

- 과목: 웹개발
- 날짜: 2026-08-14
- 태그: react, typescript, tailwindcss, vite, 버킷리스트, localstorage

## 설명

Someday는 사용자가 '언젠가 해보고 싶은 일'들을 모아서 기록하고 계획 중, 진행 중, 완료 등 단계별 상태를 관리할 수 있는 개인용 라이프 버킷리스트 아카이브 웹 애플리케이션입니다. React, TypeScript, Vite, Tailwind CSS를 활용하여 구축되었으며 백엔드 서버 없이 브라우저의 localStorage를 통해 지속적인 데이터 관리가 가능하도록 구현되었습니다. 각 버킷 항목별로 카테고리, 목표일, 중요도, 메모, 후기 및 사진 등록 기능과 함께 D-Day 자동 계산 및 '목표일 지남' 알림 상태를 시각적으로 보여줍니다. 또한 검색어 입력, 다중 필터(카테고리 및 상태 중첩 적용), 정렬(목표일, 중요도, 등록순) 기능과 달성률 요약 통계를 제공하여 사용자가 쉽게 버킷 목표를 관리할 수 있도록 설계되었습니다.

## 코드

**Someday/.oxlintrc.json**

Oxlint 린터 설정 파일입니다. React 및 TypeScript 관련 플러그인을 활성화하고 훅(Hooks) 사용 규칙 등의 코드 품질 기준을 정의합니다.

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

**Someday/index.html**

웹 애플리케이션의 엔트리 포인트 역할을 하는 HTML 파일입니다. 메타 태그 설정과 앱의 루트 DOM 엘리먼트 및 메인 스크립트를 연결합니다.

```html
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Someday</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Someday/package-lock.json**

프로젝트에 의존하는 모든 npm 패키지들의 정확한 버전과 트리를 고정 및 기록하여 환경 간 동일한 빌드를 보장하는 잠금 파일입니다.

```json
{
  "name": "someday",
  "version": "0.0.0",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "name": "someday",
      "version": "0.0.0",
      "dependencies": {
        "@tailwindcss/vite": "^4.3.3",
        "date-fns": "^4.4.0",
        "lucide-react": "^1.29.0",
        "react": "^19.2.8",
        "react-dom": "^19.2.8",
        "tailwindcss": "^4.3.3"
      },
      "devDependencies": {
        "@types/node": "^24.13.3",
        "@types/react": "^19.2.17",
        "@types/react-dom": "^19.2.3",
        "@vitejs/plugin-react": "^6.0.4",
        "oxlint": "^1.75.0",
        "typescript": "~6.0.2",
        "vite": "^8.2.0"
      }
    },
    "node_modules/@jridgewell/gen-mapping": {
      "version": "0.3.13",
      "resolved": "https://registry.npmjs.org/@jridgewell/gen-mapping/-/gen-mapping-0.3.13.tgz",
      "integrity": "sha512-2kkt/7niJ6MgEPxF0bYdQ6etZaA+fQvDcLKckhy1yIQOzaoKjBBjSj63/aLVjYE3qhRt5dvM+uUyfCg6UKCBbA==",
      "license": "MIT",
      "dependencies": {
        "@jridgewell/sourcemap-codec": "^1.5.0",
        "@jridgewell/trace-mapping": "^0.3.24"
      }
    },
    "node_modules/@jridgewell/remapping": {
      "version": "2.3.5",
      "resolved": "https://registry.npmjs.org/@jridgewell/remapping/-/remapping-2.3.5.tgz",
      "integrity": "sha512-LI9u/+laYG4Ds1TDKSJW2YPrIlcVYOwi2fUC6xB43lueCjgxV4lffOCZCtYFiH6TNOX+tQKXx97T4IKHbhyHEQ==",
      "license": "MIT",
      "dependencies": {
        "@jridgewell/gen-mapping": "^0.3.5",
        "@jridgewell/trace-mapping": "^0.3.24"
      }
    },
    "node_modules/@jridgewell/resolve-uri": {
      "version": "3.1.2",
      "resolved": "https://registry.npmjs.org/@jridgewell/resolve-uri/-/resolve-uri-3.1.2.tgz",
      "integrity": "sha512-bRISgCIjP20/tbWSPWMEi54QVPRZExkuD9lJL+UIxUKtwVJA8wW1Trb1jMs1RFXo1CBTNZ/5hpC9QvmKWdopKw==",
      "license": "MIT",
      "engines": {
        "node": ">=6.0.0"
      }
    },
    "node_modules/@jridgewell/sourcemap-codec": {
      "version": "1.5.5",
      "resolved": "https://registry.npmjs.org/@jridgewell/sourcemap-codec/-/sourcemap-codec-1.5.5.tgz",
      "integrity": "sha512-cYQ9310grqxueWbl+WuIUIaiUaDcj7WOq5fVhEljNVgRfOUhY9fy2zTvfoqWsnebh8Sl70VScFbICvJnLKB0Og==",
      "license": "MIT"
    },
    "node_modules/@jridgewell/trace-mapping": {
      "version": "0.3.31",
      "resolved": "https://registry.npmjs.org/@jridgewell/trace-mapping/-/trace-mapping-0.3.31.tgz",
      "integrity": "sha512-zzNR+SdQSDJzc8joaeP8QQoCQr8NuYx2dIIytl1QeBEZHJ9uW6hebsrYgbz8hJwUQao3TWCMtmfV8Nu1twOLAw==",
      "license": "MIT",
      "dependencies": {
        "@jridgewell/resolve-uri": "^3.1.0",
        "@jridgewell/sourcemap-codec": "^1.4.14"
      }
    },
    "node_modules/@oxc-project/types": {
      "version": "0.143.0",
      "resolved": "https://registry.npmjs.org/@oxc-project/types/-/types-0.143.0.tgz",
      "integrity": "sha512-u6JZdLBTLotrNC9Vd6vPssINdzcCzleKAH6EJKImQb7GtYvX5keN2dxkoK44stCc4tffE6QQRtZTXVSzsLUlWA==",
      "license": "MIT",
      "funding": {
        "url": "https://github.com/sponsors/Boshen"
      }
    },
    "node_modules/@oxlint/binding-android-arm-eabi": {
      "version": "1.77.0",
      "resolved": "https://registry.npmjs.org/@oxlint/binding-android-arm-eabi/-/binding-android-arm-eabi-1.77.0.tgz",
      "integrity": "sha512-E06sKWS6PiI6HRxS1wyQg22HvApt01hI7fV+T3wUk3OSbaaP4a3hYGY/MIQDmASqCiRjBdpRQYkgMkqH82cWmQ==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@oxlint/binding-android-arm64": {
      "version": "1.77.0",
      "resolved": "https://registry.npmjs.org/@oxlint/binding-android-arm64/-/binding-android-arm64-1.77.0.tgz",
      "integrity": "sha512-NvsKz0KZxTp9cYWPLf+FXaSZwB3oO3peAjtukpOMBgse2vhQSoIIVqeO1yR0lEo/UcdZIDL18uq+kL0LzQ0ytA==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@oxlint/binding-darwin-arm64": {
      "version": "1.77.0",
      "resolved": "https://registry.npmjs.org/@oxlint/binding-darwin-arm64/-/binding-darwin-arm64-1.77.0.tgz",
      "integrity": "sha512-bgjTn6nW4bQCFBvSvuHCpDD+sONvmpo4lGI4PxzMt1quBA+xYxhczk6RiCn3GZ9gY8uhaBbwhj9MdKGfu6T9DA==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@oxlint/binding-darwin-x64": {
      "version": "1.77.0",
      "resolved": "https://registry.npmjs.org/@oxlint/binding-darwin-x64/-/binding-darwin-x64-1.77.0.tgz",
      "integrity": "sha512-aotaIttH1R6j1Rwhx0M0htgeZyGtVQqYNTVEYMN/UcgHPquGA6kmk9OyuDc3a2GKUQBC+3C3GVQCcrRPMYqAFA==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@oxlint/binding-freebsd-x64": {
      "version": "1.77.0",
      "resolved": "https://registry.npmjs.org/@oxlint/binding-freebsd-x64/-/binding-freebsd-x64-1.77.0.tgz",
      "integrity": "sha512-nNx/wta7ksRAdYvq+l4AWjXkLxEXHALhENxjj2cYbQAIR4ybaA5L+hCbE63HOmft5czQ6ks+hb8vmEAnn7YGPg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@oxlint/binding-linux-arm-gnueabihf": {
      "version": "1.77.0",
      "resolved": "https://registry.npmjs.org/@oxlint/binding-linux-arm-gnueabihf/-/binding-linux-arm-gnueabihf-1.77.0.tgz",
      "integrity": "sha512-tMLLjM7xXtzXisVCzkOTXNCy9bZVId2wteNwjohlFDR/jY6WagpEDA1c1wu4xRc20Hojaxj+V6DSR7gbKxijWA==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@oxlint/binding-linux-arm-musleabihf": {
      "version": "1.77.0",
      "resolved": "https://registry.npmjs.org/@oxlint/binding-linux-arm-musleabihf/-/binding-linux-arm-musleabihf-1.77.0.tgz",
      "integrity": "sha512-MiAFDFaqR0tmHTAyo0YDcZ5hyLREdYw/RQhc2R3cbT+8O3tB+zqPM2th9TTQ+Uo3jn/embS+DO+HyX9ztCPkOQ==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@oxlint/binding-linux-arm64-gnu": {
      "version": "1.77.0",
      "resolved": "https://registry.npmjs.org/@oxlint/binding-linux-arm64-gnu/-/binding-linux-arm64-gnu-1.77.0.tgz",
      "integrity": "sha512-/xqQ3B16i1T4cyt/9Mn+4CpzhUXoBXp7kVpIwzOXNFLj5JmK1bIjsbSnX296Gg8A/o7oDtKWikFgBx0SLwztkw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@oxlint/binding-linux-arm64-musl": {
      "version": "1.77.0",
      "resolved": "https://registry.npmjs.org/@oxlint/binding-linux-arm64-musl/-/binding-linux-arm64-musl-1.77.0.tgz",
      "integrity": "sha512-LSbwuRKiNCenPDcbARqAZ5RfBy7gmj7vOvfJRLeCDU3gFtSxWbhv/+VTlaUqzUhNj1gFLHB8h7ALnxa/Az6z6g==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "libc": [
        "musl"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@oxlint/binding-linux-ppc64-gnu": {
      "version": "1.77.0",
      "resolved": "https://registry.npmjs.org/@oxlint/binding-linux-ppc64-gnu/-/binding-linux-ppc64-gnu-1.77.0.tgz",
      "integrity": "sha512-QWdcH31mXEUe5Nq1s0CfCpceaKjIo9uZtwDjAuL681g1axf+5x8xrg/eXWaw//4NCxYZ4V4e5Hu5tvdR+pTBlg==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@oxlint/binding-linux-riscv64-gnu": {
      "version": "1.77.0",
      "resolved": "https://registry.npmjs.org/@oxlint/binding-linux-riscv64-gnu/-/binding-linux-riscv64-gnu-1.77.0.tgz",
      "integrity": "sha512-GnOfYgJxbcElOiPZaDFDl406ONddwvOWk2jvAAAEjwAl4GofNoHF+/HHUIBYa6bFCArlcGPi0XjC4cU1pkgF/Q==",
      "cpu": [
        "riscv64"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@oxlint/binding-linux-riscv64-musl": {
      "version": "1.77.0",
      "resolved": "https://registry.npmjs.org/@oxlint/binding-linux-riscv64-musl/-/binding-linux-riscv64-musl-1.77.0.tgz",
      "integrity": "sha512-AyEMTUCf0xY+hHF+IxqXFQIX0yQOIR8ykpY0lJNOw9xYqOzUX8dyZfRvlG0RfXwuQn2eonf/8NrMmDSZJjdqsA==",
      "cpu": [
        "riscv64"
      ],
      "dev": true,
      "libc": [
        "musl"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@oxlint/binding-linux-s390x-gnu": {
      "version": "1.77.0",
      "resolved": "https://registry.npmjs.org/@oxlint/binding-linux-s390x-gnu/-/binding-linux-s390x-gnu-1.77.0.tgz",
      "integrity": "sha512-sPLzEcNvxd/oyVQ5oZo92CiHkFkpBeRop13E/P3TPY+hZfXHKCOWKI70TE2RYwMKFJDc20EMjH16L7NZICtKTw==",
      "cpu": [
        "s390x"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@oxlint/binding-linux-x64-gnu": {
      "version": "1.77.0",
      "resolved": "https://registry.npmjs.org/@oxlint/binding-linux-x64-gnu/-/binding-linux-x64-gnu-1.77.0.tgz",
      "integrity": "sha512-1Oh2ssH2L7lwyvkdSqaMUfsGfwU2Wfvew+obBUYjRVqhpBcUpwnsPSEr1IzVi9XqkuY10geiLsNKecqaZC34Dw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@oxlint/binding-linux-x64-musl": {
      "version": "1.77.0",
      "resolved": "https://registry.npmjs.org/@oxlint/binding-linux-x64-musl/-/binding-linux-x64-musl-1.77.0.tgz",
      "integrity": "sha512-0j/2wRgNGO+Qj/M1uu/p57h/hFTTWWcfie0ufkbabeus2s5+/QqkCflnMOwLLN5m2GsNeWp4xdl4cPa4n7QCOQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "libc": [
        "musl"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@oxlint/binding-openharmony-arm64": {
      "version": "1.77.0",
      "resolved": "https://registry.npmjs.org/@oxlint/binding-openharmony-arm64/-/binding-openharmony-arm64-1.77.0.tgz",
      "integrity": "sha512-BJ/j54qS0usEnyDkLYURMj2iiD9h5Cyy+ppzeMSXBGRXaGRNWnj1Mw14NqWMR5E/PzdgB30OOCCzLzbRoduafw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "openharmony"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@oxlint/binding-win32-arm64-msvc": {
      "version": "1.77.0",
      "resolved": "https://registry.npmjs.org/@oxlint/binding-win32-arm64-msvc/-/binding-win32-arm64-msvc-1.77.0.tgz",
      "integrity": "sha512-Yh8w+g2Lpx7StrvtYkoz9JJvXjB9wxgFChFNb85nrXm/wj/XTwGWS1hve9+900HL7llrntYB3YP+y32E3tRqzA==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@oxlint/binding-win32-ia32-msvc": {
      "version": "1.77.0",
      "resolved": "https://registry.npmjs.org/@oxlint/binding-win32-ia32-msvc/-/binding-win32-ia32-msvc-1.77.0.tgz",
      "integrity": "sha512-zja5b7+6a7UsRFgAQSrnax5vrzliEyNPLCjfXONu/vTWswaIVZGFajJZptaeRvPE4LghtFdAzVFlexTm7MVTGA==",
      "cpu": [
        "ia32"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@oxlint/binding-win32-x64-msvc": {
      "version": "1.77.0",
      "resolved": "https://registry.npmjs.org/@oxlint/binding-win32-x64-msvc/-/binding-win32-x64-msvc-1.77.0.tgz",
      "integrity": "sha512-+teyvPDZ2RjUvo+SuCqS/UhaJl1QtdW5fWT5NJTV61V5MIuIS90Db9LixmtEGvXixyttiK62P96MSu3UlpviBw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-android-arm64": {
      "version": "1.2.3",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-android-arm64/-/binding-android-arm64-1.2.3.tgz",
      "integrity": "sha512-zrJtHDcaZJ1Fp7xf4hNl+7seH9Cn/N5TwLYkhgXREtBwAd/jaqW3uqeHxpDugJLVICWg4eW44kOQEGJ1r6jCGw==",
      "cpu": [
        "arm64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-darwin-arm64": {
      "version": "1.2.3",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-darwin-arm64/-/binding-darwin-arm64-1.2.3.tgz",
      "integrity": "sha512-ieIiibVCp0tX7TLu2cafoNPv8wJyYi01ekXpbf8q2j7F4rGAhhXb/eQh7ge9DRBY78GwmRQtvjZDux7EDbA8kA==",
      "cpu": [
        "arm64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-darwin-x64": {
      "version": "1.2.3",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-darwin-x64/-/binding-darwin-x64-1.2.3.tgz",
      "integrity": "sha512-Zh9tCon19eDXJoihx0rqKhMUlMYqzwj3aPsSuHmI4RWZh62dWUL+DJN4C5YQya5TcQBJU/Fe8+rY0jhXTQITqA==",
      "cpu": [
        "x64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-freebsd-x64": {
      "version": "1.2.3",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-freebsd-x64/-/binding-freebsd-x64-1.2.3.tgz",
      "integrity": "sha512-nGbJWewA1wrXXZiQhjAT5rhibGfns5ZNkDVqxsO6zJ3f3YvpoDNNmGMSbbhLuXKjNScaBJVOAboztAWVespQMg==",
      "cpu": [
        "x64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-arm-gnueabihf": {
      "version": "1.2.3",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-arm-gnueabihf/-/binding-linux-arm-gnueabihf-1.2.3.tgz",
      "integrity": "sha512-QNniJr5Kml0kDEB98jiDOJjXNroxIIi0IXIbdYzY26Xt1pVbeP62+KnoIZLwirOymX/0jDk/2gI/bNUv7A7OIw==",
      "cpu": [
        "arm"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-arm64-gnu": {
      "version": "1.2.3",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-arm64-gnu/-/binding-linux-arm64-gnu-1.2.3.tgz",
      "integrity": "sha512-TkqEAcmmvH3I/q4114NB4RVt6241Dao48pF45uLcFGrwAaIn0iITgTAKP/dLjbN0R4buJjGb91+UHSoFmpgIWw==",
      "cpu": [
        "arm64"
      ],
      "libc": [
        "glibc"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-arm64-musl": {
      "version": "1.2.3",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-arm64-musl/-/binding-linux-arm64-musl-1.2.3.tgz",
      "integrity": "sha512-NHqjnxpsndf4MPymxteFAWHHfkTL8HjWh1KB7z23ofZ6QO2euONuxDXjat69dKZRALnGypg8k8SsK8vZJoXv1Q==",
      "cpu": [
        "arm64"
      ],
      "libc": [
        "musl"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-ppc64-gnu": {
      "version": "1.2.3",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-ppc64-gnu/-/binding-linux-ppc64-gnu-1.2.3.tgz",
      "integrity": "sha512-6tbrbwfz5GB9DQ4Jwo6hy9v+vR31xZlvzZ6n5Xut6Hhx5PvrA9q/HsK8KMaYQp063iqZGXwNvZtYNLD7EM/x0w==",
      "cpu": [
        "ppc64"
      ],
      "libc": [
        "glibc"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-s390x-gnu": {
      "version": "1.2.3",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-s390x-gnu/-/binding-linux-s390x-gnu-1.2.3.tgz",
      "integrity": "sha512-oyuXxXmoZHjXC917IAPFAAv4wWAa0cM9afk8nx1+9/jNNOX1uPf8yDA6p7G0RypOfw/X0PQt5IfoquY1um+zSg==",
      "cpu": [
        "s390x"
      ],
      "libc": [
        "glibc"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-x64-gnu": {
      "version": "1.2.3",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-x64-gnu/-/binding-linux-x64-gnu-1.2.3.tgz",
      "integrity": "sha512-TytMwF2KVGqP2tgd0I1OY0PAv78dZRAYcF5ssDzjM34SUXCED3uXvSd5+lHoC0bTD6eEdFz7LdQNCO1y0oVk9w==",
      "cpu": [
        "x64"
      ],
      "libc": [
        "glibc"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-x64-musl": {
      "version": "1.2.3",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-x64-musl/-/binding-linux-x64-musl-1.2.3.tgz",
      "integrity": "sha512-/E9m3qstrJFVPoULV25mVQblSNExY2+kBsYe4sy0Tn0yOOgJ8wZbZt3KnRbF/XeU2Gl1STKUQnDNTqhIE5MD4A==",
      "cpu": [
        "x64"
      ],
      "libc": [
        "musl"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-openharmony-arm64": {
      "version": "1.2.3",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-openharmony-arm64/-/binding-openharmony-arm64-1.2.3.tgz",
      "integrity": "sha512-Kr0OcsoQI816i6HOl3vFHpd1K0eZyh76zgfj4c1nTyaTsd5r2Mj1lwM4R90y/qaCfmTn9eHy0SKwi98eitRxug==",
      "cpu": [
        "arm64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "openharmony"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-win32-arm64-msvc": {
      "version": "1.2.3",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-win32-arm64-msvc/-/binding-win32-arm64-msvc-1.2.3.tgz",
      "integrity": "sha512-hOtMwTqnME+/gJcH/PCZ0wn0zPUjiWOgkHpxbSJpfGKMezHltx1S7/k1SitzVa7Ww2cqrDDaFbZEhcJZO8o+Jw==",
      "cpu": [
        "arm64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-win32-x64-msvc": {
      "version": "1.2.3",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-win32-x64-msvc/-/binding-win32-x64-msvc-1.2.3.tgz",
      "integrity": "sha512-ekcqMMkI2PlhYnfzQnB/cEdYUVVJViWvoUyLrbzgDoi3Snfc1mVBwdnc306ufA5ejy8JSPjT2RlW1nQSjW7efg==",
      "cpu": [
        "x64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/pluginutils": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/@rolldown/pluginutils/-/pluginutils-1.0.1.tgz",
      "integrity": "sha512-2j9bGt5Jh8hj+vPtgzPtl72j0yRxHAyumoo6TNfAjsLB04UtpSvPbPcDcBMxz7n+9CYB0c1GxQFxYRg2jimqGw==",
      "license": "MIT"
    },
    "node_modules/@tailwindcss/node": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/node/-/node-4.3.3.tgz",
      "integrity": "sha512-/T8IKEsf9VTU6tLjgC7+sv2mOPtQxzE2jMw7u4Tt40Tx+QSZxpzh95/H6cMKoja9XuW7iMdLJYBB0o9G1CaAgg==",
      "license": "MIT",
      "dependencies": {
        "@jridgewell/remapping": "^2.3.5",
        "enhanced-resolve": "^5.24.1",
        "jiti": "^2.7.0",
        "lightningcss": "1.32.0",
        "magic-string": "^0.30.21",
        "source-map-js": "^1.2.1",
        "tailwindcss": "4.3.3"
      }
    },
    "node_modules/@tailwindcss/node/node_modules/lightningcss": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss/-/lightningcss-1.32.0.tgz",
      "integrity": "sha512-NXYBzinNrblfraPGyrbPoD19C1h9lfI/1mzgWYvXUTe414Gz/X1FD2XBZSZM7rRTrMA8JL3OtAaGifrIKhQ5yQ==",
      "license": "MPL-2.0",
      "dependencies": {
        "detect-libc": "^2.0.3"
      },
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      },
      "optionalDependencies": {
        "lightningcss-android-arm64": "1.32.0",
        "lightningcss-darwin-arm64": "1.32.0",
        "lightningcss-darwin-x64": "1.32.0",
        "lightningcss-freebsd-x64": "1.32.0",
        "lightningcss-linux-arm-gnueabihf": "1.32.0",
        "lightningcss-linux-arm64-gnu": "1.32.0",
        "lightningcss-linux-arm64-musl": "1.32.0",
        "lightningcss-linux-x64-gnu": "1.32.0",
        "lightningcss-linux-x64-musl": "1.32.0",
        "lightningcss-win32-arm64-msvc": "1.32.0",
        "lightningcss-win32-x64-msvc": "1.32.0"
      }
    },
    "node_modules/@tailwindcss/node/node_modules/lightningcss-android-arm64": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-android-arm64/-/lightningcss-android-arm64-1.32.0.tgz",
      "integrity": "sha512-YK7/ClTt4kAK0vo6w3X+Pnm0D2cf2vPHbhOXdoNti1Ga0al1P4TBZhwjATvjNwLEBCnKvjJc2jQgHXH0NEwlAg==",
      "cpu": [
        "arm64"
      ],
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/@tailwindcss/node/node_modules/lightningcss-darwin-arm64": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-darwin-arm64/-/lightningcss-darwin-arm64-1.32.0.tgz",
      "integrity": "sha512-RzeG9Ju5bag2Bv1/lwlVJvBE3q6TtXskdZLLCyfg5pt+HLz9BqlICO7LZM7VHNTTn/5PRhHFBSjk5lc4cmscPQ==",
      "cpu": [
        "arm64"
      ],
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/@tailwindcss/node/node_modules/lightningcss-darwin-x64": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-darwin-x64/-/lightningcss-darwin-x64-1.32.0.tgz",
      "integrity": "sha512-U+QsBp2m/s2wqpUYT/6wnlagdZbtZdndSmut/NJqlCcMLTWp5muCrID+K5UJ6jqD2BFshejCYXniPDbNh73V8w==",
      "cpu": [
        "x64"
      ],
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/@tailwindcss/node/node_modules/lightningcss-freebsd-x64": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-freebsd-x64/-/lightningcss-freebsd-x64-1.32.0.tgz",
      "integrity": "sha512-JCTigedEksZk3tHTTthnMdVfGf61Fky8Ji2E4YjUTEQX14xiy/lTzXnu1vwiZe3bYe0q+SpsSH/CTeDXK6WHig==",
      "cpu": [
        "x64"
      ],
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/@tailwindcss/node/node_modules/lightningcss-linux-arm-gnueabihf": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-arm-gnueabihf/-/lightningcss-linux-arm-gnueabihf-1.32.0.tgz",
      "integrity": "sha512-x6rnnpRa2GL0zQOkt6rts3YDPzduLpWvwAF6EMhXFVZXD4tPrBkEFqzGowzCsIWsPjqSK+tyNEODUBXeeVHSkw==",
      "cpu": [
        "arm"
      ],
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/@tailwindcss/node/node_modules/lightningcss-linux-arm64-gnu": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-arm64-gnu/-/lightningcss-linux-arm64-gnu-1.32.0.tgz",
      "integrity": "sha512-0nnMyoyOLRJXfbMOilaSRcLH3Jw5z9HDNGfT/gwCPgaDjnx0i8w7vBzFLFR1f6CMLKF8gVbebmkUN3fa/kQJpQ==",
      "cpu": [
        "arm64"
      ],
      "libc": [
        "glibc"
      ],
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/@tailwindcss/node/node_modules/lightningcss-linux-arm64-musl": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-arm64-musl/-/lightningcss-linux-arm64-musl-1.32.0.tgz",
      "integrity": "sha512-UpQkoenr4UJEzgVIYpI80lDFvRmPVg6oqboNHfoH4CQIfNA+HOrZ7Mo7KZP02dC6LjghPQJeBsvXhJod/wnIBg==",
      "cpu": [
        "arm64"
      ],
      "libc": [
        "musl"
      ],
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/@tailwindcss/node/node_modules/lightningcss-linux-x64-gnu": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-x64-gnu/-/lightningcss-linux-x64-gnu-1.32.0.tgz",
      "integrity": "sha512-V7Qr52IhZmdKPVr+Vtw8o+WLsQJYCTd8loIfpDaMRWGUZfBOYEJeyJIkqGIDMZPwPx24pUMfwSxxI8phr/MbOA==",
      "cpu": [
        "x64"
      ],
      "libc": [
        "glibc"
      ],
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/@tailwindcss/node/node_modules/lightningcss-linux-x64-musl": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-x64-musl/-/lightningcss-linux-x64-musl-1.32.0.tgz",
      "integrity": "sha512-bYcLp+Vb0awsiXg/80uCRezCYHNg1/l3mt0gzHnWV9XP1W5sKa5/TCdGWaR/zBM2PeF/HbsQv/j2URNOiVuxWg==",
      "cpu": [
        "x64"
      ],
      "libc": [
        "musl"
      ],
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/@tailwindcss/node/node_modules/lightningcss-win32-arm64-msvc": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-win32-arm64-msvc/-/lightningcss-win32-arm64-msvc-1.32.0.tgz",
      "integrity": "sha512-8SbC8BR40pS6baCM8sbtYDSwEVQd4JlFTOlaD3gWGHfThTcABnNDBda6eTZeqbofalIJhFx0qKzgHJmcPTnGdw==",
      "cpu": [
        "arm64"
      ],
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/@tailwindcss/node/node_modules/lightningcss-win32-x64-msvc": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-win32-x64-msvc/-/lightningcss-win32-x64-msvc-1.32.0.tgz",
      "integrity": "sha512-Amq9B/SoZYdDi1kFrojnoqPLxYhQ4Wo5XiL8EVJrVsB8ARoC1PWW6VGtT0WKCemjy8aC+louJnjS7U18x3b06Q==",
      "cpu": [
        "x64"
      ],
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/@tailwindcss/oxide": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide/-/oxide-4.3.3.tgz",
      "integrity": "sha512-krXjAikiaFSPaK/FkAQT5UTx3VormQaiZ5hBFlJZ9UFQGB/rwg1MZIhHAG9smMQRTdyJxP6Qt5MwMtdyU5FWrA==",
      "license": "MIT",
      "engines": {
        "node": ">= 20"
      },
      "optionalDependencies": {
        "@tailwindcss/oxide-android-arm64": "4.3.3",
        "@tailwindcss/oxide-darwin-arm64": "4.3.3",
        "@tailwindcss/oxide-darwin-x64": "4.3.3",
        "@tailwindcss/oxide-freebsd-x64": "4.3.3",
        "@tailwindcss/oxide-linux-arm-gnueabihf": "4.3.3",
        "@tailwindcss/oxide-linux-arm64-gnu": "4.3.3",
        "@tailwindcss/oxide-linux-arm64-musl": "4.3.3",
        "@tailwindcss/oxide-linux-x64-gnu": "4.3.3",
        "@tailwindcss/oxide-linux-x64-musl": "4.3.3",
        "@tailwindcss/oxide-wasm32-wasi": "4.3.3",
        "@tailwindcss/oxide-win32-arm64-msvc": "4.3.3",
        "@tailwindcss/oxide-win32-x64-msvc": "4.3.3"
      }
    },
    "node_modules/@tailwindcss/oxide-android-arm64": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-android-arm64/-/oxide-android-arm64-4.3.3.tgz",
      "integrity": "sha512-Y85A2gmPSkl5Ve5qR86GL4HT509cFqQh1aes9p3sSkyTPwt0Pppf3GkwGe4JPACcRYjgJIEhQgM6dBClnr0NYw==",
      "cpu": [
        "arm64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/oxide-darwin-arm64": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-darwin-arm64/-/oxide-darwin-arm64-4.3.3.tgz",
      "integrity": "sha512-BiaWatpBcERQFDlOjRDpIVXuFK5PJez5SA4JMg6VYZdBYU+qKfV/vqjcIs+IYmtitf1xYQZTwXvU/8y4lfZUGw==",
      "cpu": [
        "arm64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/oxide-darwin-x64": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-darwin-x64/-/oxide-darwin-x64-4.3.3.tgz",
      "integrity": "sha512-fAeUqfV5ndhxRwai8cXGzdLvul9utWOmeTkv69unv4ZXixjn61Z+p9lCWdwOwA3TYboG3BwdVuN/RDjhBRl0mw==",
      "cpu": [
        "x64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/oxide-freebsd-x64": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-freebsd-x64/-/oxide-freebsd-x64-4.3.3.tgz",
      "integrity": "sha512-iyf5bV6+wnAlflVeEy7R25dupxTNECZN5QMI0qNT6eT+EgaGdZcKhGkr5SdoaWiLJ3spLqIY9VCeSGrwmtg4kw==",
      "cpu": [
        "x64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/oxide-linux-arm-gnueabihf": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-linux-arm-gnueabihf/-/oxide-linux-arm-gnueabihf-4.3.3.tgz",
      "integrity": "sha512-aAYUprJAJQWWbRrPvtjdroZ56Md+JM8pMiopS6xGEwDfLhqj+2ver2p4nU4Mb3CRqcMmNBjo8KkUgcxhkzVQGQ==",
      "cpu": [
        "arm"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/oxide-linux-arm64-gnu": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-linux-arm64-gnu/-/oxide-linux-arm64-gnu-4.3.3.tgz",
      "integrity": "sha512-nDxldcEENOxZRzC2uu9jrutZdAAQtb+8WWDCSnWL1zvBk1+FN+x6MtDViPB5AJMfttVCUhehGWus3XBPgatM/w==",
      "cpu": [
        "arm64"
      ],
      "libc": [
        "glibc"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/oxide-linux-arm64-musl": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-linux-arm64-musl/-/oxide-linux-arm64-musl-4.3.3.tgz",
      "integrity": "sha512-Md44bD6veX/PC5iyF8cDVnw4HBIANZepRZZ7a8DQOvkfo5WUBwcp6iAuCUz23u+4SUkhJlD3eL7hNdW8ezd/kA==",
      "cpu": [
        "arm64"
      ],
      "libc": [
        "musl"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/oxide-linux-x64-gnu": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-linux-x64-gnu/-/oxide-linux-x64-gnu-4.3.3.tgz",
      "integrity": "sha512-tx7us1muwOKAKWao2v/GaafFeQboE6aj88vC6ziN2NCGcRm8gWUhwjzg+YdVB1e4boAtdtma4L43onunI6NS4w==",
      "cpu": [
        "x64"
      ],
      "libc": [
        "glibc"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/oxide-linux-x64-musl": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-linux-x64-musl/-/oxide-linux-x64-musl-4.3.3.tgz",
      "integrity": "sha512-SJxX60smvHgasZoBy11dX6YRjXJFovwWBoedhbQPOBzgFWBHGB+TVPWB9BxzR7TTxU8FQZAI2AyiNCMzFm8Img==",
      "cpu": [
        "x64"
      ],
      "libc": [
        "musl"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/oxide-wasm32-wasi": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-wasm32-wasi/-/oxide-wasm32-wasi-4.3.3.tgz",
      "integrity": "sha512-jx1+rPhY/5Ympkktd656HBWEBLxP7dH06losBLjjf5vgCODXvi9KhtftWcMIwTFIDqBr7cRnQkdLnAG+IOlGvQ==",
      "bundleDependencies": [
        "@napi-rs/wasm-runtime",
        "@emnapi/core",
        "@emnapi/runtime",
        "@tybys/wasm-util",
        "@emnapi/wasi-threads",
        "tslib"
      ],
      "cpu": [
        "wasm32"
      ],
      "license": "MIT",
      "optional": true,
      "dependencies": {
        "@emnapi/core": "^1.11.1",
        "@emnapi/runtime": "^1.11.1",
        "@emnapi/wasi-threads": "^1.2.2",
        "@napi-rs/wasm-runtime": "^1.1.4",
        "@tybys/wasm-util": "^0.10.2",
        "tslib": "^2.8.1"
      },
      "engines": {
        "node": ">=14.0.0"
      }
    },
    "node_modules/@tailwindcss/oxide-win32-arm64-msvc": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-win32-arm64-msvc/-/oxide-win32-arm64-msvc-4.3.3.tgz",
      "integrity": "sha512-3rc292Ca2ceK6Ulcc/bAVnTs/3nDtoPhyEKlgPv+yQJQi/JS/AMJlqzxvlDacL1nekbrcf6bTqp/jV4qgnPxNQ==",
      "cpu": [
        "arm64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/oxide-win32-x64-msvc": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-win32-x64-msvc/-/oxide-win32-x64-msvc-4.3.3.tgz",
      "integrity": "sha512-yJ0pwIVc/nYeGoV02WtsN8KYyLQv7kyI2wDnkezyJlGGjkd4QLwDGAwl47YpPJeuI0M0ObaXGSPjvWDPeTPggw==",
      "cpu": [
        "x64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/vite": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/vite/-/vite-4.3.3.tgz",
      "integrity": "sha512-yYU8cogLeSh/ms2jh8Fj7jaba/EWa7Ja6GoUqYZaraEuCI5YS6ms6ObZgjjedm+jm6XZjdNRWBpPP6Z86oOxcw==",
      "license": "MIT",
      "dependencies": {
        "@tailwindcss/node": "4.3.3",
        "@tailwindcss/oxide": "4.3.3",
        "tailwindcss": "4.3.3"
      },
      "peerDependencies": {
        "vite": "^5.2.0 || ^6 || ^7 || ^8"
      }
    },
    "node_modules/@types/node": {
      "version": "24.13.3",
      "resolved": "https://registry.npmjs.org/@types/node/-/node-24.13.3.tgz",
      "integrity": "sha512-Dh8vAsV36ig5wa9OX4pXvMc9D3Veibfw2wix0CUwYODLD8nkj9UsLjASr49nPg+2eKzxhBV+v7L8pXvT4e639Q==",
      "devOptional": true,
      "license": "MIT",
      "dependencies": {
        "undici-types": "~7.18.0"
      }
    },
    "node_modules/@types/react": {
      "version": "19.2.18",
      "resolved": "https://registry.npmjs.org/@types/react/-/react-19.2.18.tgz",
      "integrity": "sha512-AnzbBERsrLKtk2XSfTbYRLjQPdy116Sty4q+T+Bp3IC4l6jNBvreVPAHmpq9qhXQM7CXZPjLVmGMw9sy+hxQ3w==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "csstype": "^3.2.2"
      }
    },
    "node_modules/@types/react-dom": {
      "version": "19.2.4",
      "resolved": "https://registry.npmjs.org/@types/react-dom/-/react-dom-19.2.4.tgz",
      "integrity": "sha512-Bsc+QHgp+P/F02XDzNCY9jnZNCUuLki36KT7VKrTXXLdHf+vHMNZnW1rVu5DNW/rCK+fya3DATySbLM4yhtKUw==",
      "dev": true,
      "license": "MIT",
      "peerDependencies": {
        "@types/react": "^19.2.0"
      }
    },
    "node_modules/@vitejs/plugin-react": {
      "version": "6.0.5",
      "resolved": "https://registry.npmjs.org/@vitejs/plugin-react/-/plugin-react-6.0.5.tgz",
      "integrity": "sha512-BOVzne/NL162sMdResB25mUv+vWMF5NoAjNf09TeGlE7ZpszZWSD3winycicLJw72yeVsoCn/2kOhEuCvEShMA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@rolldown/pluginutils": "^1.0.1"
      },
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      },
      "peerDependencies": {
        "@rolldown/plugin-babel": "^0.1.7 || ^0.2.0",
        "babel-plugin-react-compiler": "^1.0.0",
        "vite": "^8.0.0"
      },
      "peerDependenciesMeta": {
        "@rolldown/plugin-babel": {
          "optional": true
        },
        "babel-plugin-react-compiler": {
          "optional": true
        }
      }
    },
    "node_modules/csstype": {
      "version": "3.2.3",
      "resolved": "https://registry.npmjs.org/csstype/-/csstype-3.2.3.tgz",
      "integrity": "sha512-z1HGKcYy2xA8AGQfwrn0PAy+PB7X/GSj3UVJW9qKyn43xWa+gl5nXmU4qqLMRzWVLFC8KusUX8T/0kCiOYpAIQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/date-fns": {
      "version": "4.4.0",
      "resolved": "https://registry.npmjs.org/date-fns/-/date-fns-4.4.0.tgz",
      "integrity": "sha512-+1UMbeh68lH1SegH83CGWwpb6OHHbpSgr3+s5Eww5M4CAgswBpoWS0AjTOfEJ33HiYKz1hdj/KTFprzXHmq/6w==",
      "license": "MIT",
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/kossnocorp"
      }
    },
    "node_modules/detect-libc": {
      "version": "2.1.2",
      "resolved": "https://registry.npmjs.org/detect-libc/-/detect-libc-2.1.2.tgz",
      "integrity": "sha512-Btj2BOOO83o3WyH59e8MgXsxEQVcarkUOpEYrubB0urwnN10yQ364rsiByU11nZlqWYZm05i/of7io4mzihBtQ==",
      "license": "Apache-2.0",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/enhanced-resolve": {
      "version": "5.24.5",
      "resolved": "https://registry.npmjs.org/enhanced-resolve/-/enhanced-resolve-5.24.5.tgz",
      "integrity": "sha512-L1l8TNvomm6UVW5B253AGxQagSQr+vGwhMlrrfRS2qmhx46AMpMVJKQYLvWYbysTMY8VoicOvzHzoHMbyzB+4A==",
      "license": "MIT",
      "dependencies": {
        "graceful-fs": "^4.2.4",
        "tapable": "^2.3.3"
      },
      "engines": {
        "node": ">=10.13.0"
      }
    },
    "node_modules/fdir": {
      "version": "6.5.0",
      "resolved": "https://registry.npmjs.org/fdir/-/fdir-6.5.0.tgz",
      "integrity": "sha512-tIbYtZbucOs0BRGqPJkshJUYdL+SDH7dVM8gjy+ERp3WAUjLEFJE+02kanyHtwjWOnwrKYBiwAmM0p4kLJAnXg==",
      "license": "MIT",
      "engines": {
        "node": ">=12.0.0"
      },
      "peerDependencies": {
        "picomatch": "^3 || ^4"
      },
      "peerDependenciesMeta": {
        "picomatch": {
          "optional": true
        }
      }
    },
    "node_modules/fsevents": {
      "version": "2.3.3",
      "resolved": "https://registry.npmjs.org/fsevents/-/fsevents-2.3.3.tgz",
      "integrity": "sha512-5xoDfX+fL7faATnagmWPpbFtwh/R77WmMMqqHGS65C3vvB0YHrgF+B1YmZ3441tMj5n63k0212XNoJwzlhffQw==",
      "hasInstallScript": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": "^8.16.0 || ^10.6.0 || >=11.0.0"
      }
    },
    "node_modules/graceful-fs": {
      "version": "4.2.11",
      "resolved": "https://registry.npmjs.org/graceful-fs/-/graceful-fs-4.2.11.tgz",
      "integrity": "sha512-RbJ5/jmFcNNCcDV5o9eTnBLJ/HszWV0P73bc+Ff4nS/rJj+YaS6IGyiOL0VoBYX+l1Wrl3k63h/KrH+nhJ0XvQ==",
      "license": "ISC"
    },
    "node_modules/jiti": {
      "version": "2.7.0",
      "resolved": "https://registry.npmjs.org/jiti/-/jiti-2.7.0.tgz",
      "integrity": "sha512-AC/7JofJvZGrrneWNaEnJeOLUx+JlGt7tNa0wZiRPT4MY1wmfKjt2+6O2p2uz2+skll8OZZmJMNqeke7kKbNgQ==",
      "license": "MIT",
      "bin": {
        "jiti": "lib/jiti-cli.mjs"
      }
    },
    "node_modules/lightningcss": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss/-/lightningcss-1.33.0.tgz",
      "integrity": "sha512-WkUDrojuJs0xkgGf2udWxa3yGBRxPtxUkB79i6aCZLRgc7PM8fZe9TosfPDcvEpQZbuFASnHYmRLBLUbmLOIIA==",
      "license": "MPL-2.0",
      "dependencies": {
        "detect-libc": "^2.0.3"
      },
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      },
      "optionalDependencies": {
        "lightningcss-android-arm64": "1.33.0",
        "lightningcss-darwin-arm64": "1.33.0",
        "lightningcss-darwin-x64": "1.33.0",
        "lightningcss-freebsd-x64": "1.33.0",
        "lightningcss-linux-arm-gnueabihf": "1.33.0",
        "lightningcss-linux-arm64-gnu": "1.33.0",
        "lightningcss-linux-arm64-musl": "1.33.0",
        "lightningcss-linux-x64-gnu": "1.33.0",
        "lightningcss-linux-x64-musl": "1.33.0",
        "lightningcss-win32-arm64-msvc": "1.33.0",
        "lightningcss-win32-x64-msvc": "1.33.0"
      }
    },
    "node_modules/lightningcss-android-arm64": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-android-arm64/-/lightningcss-android-arm64-1.33.0.tgz",
      "integrity": "sha512-gEpRTalKdosp4Bb8qWtc2iOgE5SeIHlpS1up9bFq2wAyYhl1UdTObYiHe98zEM9SQvSoqQZ1IQD0JNpg3Ml5pg==",
      "cpu": [
        "arm64"
      ],
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-darwin-arm64": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-darwin-arm64/-/lightningcss-darwin-arm64-1.33.0.tgz",
      "integrity": "sha512-Sciaz8eenNTKn9b3t7+xr0ipTp9YxKQY4npwQ3mrRuL0BAVHBLyZxofhaKBAVtzmtRZ/zTyo0/to4B1uWG/Djg==",
      "cpu": [
        "arm64"
      ],
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-darwin-x64": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-darwin-x64/-/lightningcss-darwin-x64-1.33.0.tgz",
      "integrity": "sha512-Z5UPAxzrjlWNNyGy6i65cJzzvgJ5D3T6wMvs+gWpY9d7qRhANrxqAp6LhxIgZhWEw18RfJTGcRxjuLIBr+m8XQ==",
      "cpu": [
        "x64"
      ],
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-freebsd-x64": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-freebsd-x64/-/lightningcss-freebsd-x64-1.33.0.tgz",
      "integrity": "sha512-QQM/Ti/hQajJwCY+RiWuCZ9sdtI/XQk7nDK5vC8kkdwixezOlDgvDx7+RT+QjK6FcFT4MpsuoBnHIo/O3StRRg==",
      "cpu": [
        "x64"
      ],
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-arm-gnueabihf": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-arm-gnueabihf/-/lightningcss-linux-arm-gnueabihf-1.33.0.tgz",
      "integrity": "sha512-N7FVBe6iS24MlM6R/4RBTxGhQheZGs7tiQ9U32UtF75NzP5Q7xWPRqLBCKxlRQRk3rY1jCIPLzx7WzOhuUIRLQ==",
      "cpu": [
        "arm"
      ],
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-arm64-gnu": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-arm64-gnu/-/lightningcss-linux-arm64-gnu-1.33.0.tgz",
      "integrity": "sha512-j2v/itmy4HlNxlc6voKXYgBqNi0Ng2LShg4z7GufpEgs05P+2suBVyi9I6YHq5uoVFx9ETin3eCEhLVyXGQnKg==",
      "cpu": [
        "arm64"
      ],
      "libc": [
        "glibc"
      ],
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-arm64-musl": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-arm64-musl/-/lightningcss-linux-arm64-musl-1.33.0.tgz",
      "integrity": "sha512-yiO5ROMuYQgXbC60yjZU5CYSFZGKXL0HFATXt9mHJn1+zW55oCtMI9NfcVhYLMFDL7gV7oBPon/EmMMGg2OvtQ==",
      "cpu": [
        "arm64"
      ],
      "libc": [
        "musl"
      ],
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-x64-gnu": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-x64-gnu/-/lightningcss-linux-x64-gnu-1.33.0.tgz",
      "integrity": "sha512-ar+Ju7LmcN0Jo4FpL4hpFybwNG9/3A/Br5KW2n2jyODg3MEZXaDYADdemoNS+BDNfMgKvylJLj4S5tyRActuAg==",
      "cpu": [
        "x64"
      ],
      "libc": [
        "glibc"
      ],
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-x64-musl": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-x64-musl/-/lightningcss-linux-x64-musl-1.33.0.tgz",
      "integrity": "sha512-RYiYbkokw0trfKqqzfF55lginwEPrD3OJDfTuJzFs1MK6iFnDenaz1fqLLtX4ITG3OktJQXOeTaw1awrBAlZPw==",
      "cpu": [
        "x64"
      ],
      "libc": [
        "musl"
      ],
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-win32-arm64-msvc": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-win32-arm64-msvc/-/lightningcss-win32-arm64-msvc-1.33.0.tgz",
      "integrity": "sha512-1K+MPfLSFVpphzpdbfkhlWk6wBrTObBzS2T6db10PNOZgR9GoVsAWzwNyuhUYYbTp23j+4RrncfujZ4uAzXvwA==",
      "cpu": [
        "arm64"
      ],
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-win32-x64-msvc": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-win32-x64-msvc/-/lightningcss-win32-x64-msvc-1.33.0.tgz",
      "integrity": "sha512-OlEICDx/Xl0FqSp4bry8zFnCvGpig3Gl4gCquvYwHuqJKEC1+n9NgDniFvqHGmMv1ZkqDJrDqKKSykTDX+ehuA==",
      "cpu": [
        "x64"
      ],
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lucide-react": {
      "version": "1.29.0",
      "resolved": "https://registry.npmjs.org/lucide-react/-/lucide-react-1.29.0.tgz",
      "integrity": "sha512-Xs9QFG5+9sNX04MdKVT4++umA+hJ2qsJVlRlRWHQ7qZobXgMiNHSpZ5eZm8JUoGCdNyoEdXoEwa8HVr0DNjOQg==",
      "license": "ISC",
      "peerDependencies": {
        "react": "^16.5.1 || ^17.0.0 || ^18.0.0 || ^19.0.0"
      }
    },
    "node_modules/magic-string": {
      "version": "0.30.21",
      "resolved": "https://registry.npmjs.org/magic-string/-/magic-string-0.30.21.tgz",
      "integrity": "sha512-vd2F4YUyEXKGcLHoq+TEyCjxueSeHnFxyyjNp80yg0XV4vUhnDer/lvvlqM/arB5bXQN5K2/3oinyCRyx8T2CQ==",
      "license": "MIT",
      "dependencies": {
        "@jridgewell/sourcemap-codec": "^1.5.5"
      }
    },
    "node_modules/nanoid": {
      "version": "3.3.17",
      "resolved": "https://registry.npmjs.org/nanoid/-/nanoid-3.3.17.tgz",
      "integrity": "sha512-xQLf0A3HOMlgHq0n247/LRuAOYmB7dXJ/DvAxGvsSBij45XtBSmQycu+F8ODbHwns/XyFZagyL1+J0Offw1E0g==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "bin": {
        "nanoid": "bin/nanoid.cjs"
      },
      "engines": {
        "node": "^10 || ^12 || ^13.7 || ^14 || >=15.0.1"
      }
    },
    "node_modules/oxlint": {
      "version": "1.77.0",
      "resolved": "https://registry.npmjs.org/oxlint/-/oxlint-1.77.0.tgz",
      "integrity": "sha512-qnGh8XJHaQ0dprrDXNQZgS0FgjI6v+V3+X8DwmaV++5Aamy6jGKfDdQ1TUvhUxtmKFAbEf4/WeO5QZX+5WSngg==",
      "dev": true,
      "license": "MIT",
      "bin": {
        "oxlint": "bin/oxlint"
      },
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      },
      "funding": {
        "url": "https://github.com/sponsors/Boshen"
      },
      "optionalDependencies": {
        "@oxlint/binding-android-arm-eabi": "1.77.0",
        "@oxlint/binding-android-arm64": "1.77.0",
        "@oxlint/binding-darwin-arm64": "1.77.0",
        "@oxlint/binding-darwin-x64": "1.77.0",
        "@oxlint/binding-freebsd-x64": "1.77.0",
        "@oxlint/binding-linux-arm-gnueabihf": "1.77.0",
        "@oxlint/binding-linux-arm-musleabihf": "1.77.0",
        "@oxlint/binding-linux-arm64-gnu": "1.77.0",
        "@oxlint/binding-linux-arm64-musl": "1.77.0",
        "@oxlint/binding-linux-ppc64-gnu": "1.77.0",
        "@oxlint/binding-linux-riscv64-gnu": "1.77.0",
        "@oxlint/binding-linux-riscv64-musl": "1.77.0",
        "@oxlint/binding-linux-s390x-gnu": "1.77.0",
        "@oxlint/binding-linux-x64-gnu": "1.77.0",
        "@oxlint/binding-linux-x64-musl": "1.77.0",
        "@oxlint/binding-openharmony-arm64": "1.77.0",
        "@oxlint/binding-win32-arm64-msvc": "1.77.0",
        "@oxlint/binding-win32-ia32-msvc": "1.77.0",
        "@oxlint/binding-win32-x64-msvc": "1.77.0"
      },
      "peerDependencies": {
        "oxlint-tsgolint": ">=7.0.2001",
        "vite-plus": "*"
      },
      "peerDependenciesMeta": {
        "oxlint-tsgolint": {
          "optional": true
        },
        "vite-plus": {
          "optional": true
        }
      }
    },
    "node_modules/picocolors": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/picocolors/-/picocolors-1.1.1.tgz",
      "integrity": "sha512-xceH2snhtb5M9liqDsmEw56le376mTZkEX/jEb/RxNFyegNul7eNslCXP9FDj/Lcu0X8KEyMceP2ntpaHrDEVA==",
      "license": "ISC"
    },
    "node_modules/picomatch": {
      "version": "4.0.5",
      "resolved": "https://registry.npmjs.org/picomatch/-/picomatch-4.0.5.tgz",
      "integrity": "sha512-RvwwcruNjI1ncT5xRakeyS9Lf8lcItv34KD+aif+VH9kduAyfYBipGh12274xtenIPZ119/R9BdTBa8gAwSh0A==",
      "license": "MIT",
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://github.com/sponsors/jonschlinkert"
      }
    },
    "node_modules/postcss": {
      "version": "8.5.26",
      "resolved": "https://registry.npmjs.org/postcss/-/postcss-8.5.26.tgz",
      "integrity": "sha512-u82N74LFzG8ca+dD8puPnplTXoGH4fTPpVGuIbt36G3qvNlkvfD0lEAZSxaly3KX8TS/L1A1gsCEmvKmBcVbkQ==",
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/postcss/"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/postcss"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "nanoid": "^3.3.17",
        "picocolors": "^1.1.1",
        "source-map-js": "^1.2.1"
      },
      "engines": {
        "node": "^10 || ^12 || >=14"
      }
    },
    "node_modules/react": {
      "version": "19.2.8",
      "resolved": "https://registry.npmjs.org/react/-/react-19.2.8.tgz",
      "integrity": "sha512-PWaYA1L/q9u2u7xYQi+Y3L3Yfnie7XyLeaJICV1MGD6LprsBxcAqGjYyr0eY3p+QdsA+x/Irkt4Qif8D63+Sbw==",
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/react-dom": {
      "version": "19.2.8",
      "resolved": "https://registry.npmjs.org/react-dom/-/react-dom-19.2.8.tgz",
      "integrity": "sha512-rVprimfGBG3DR+Tq0IQG2DT5PxKth1WIGDmj5yPmlzr4YBe7uyE+Du4oVqTDXZSHGGGXRtTJEGSSePyQCMBglQ==",
      "license": "MIT",
      "dependencies": {
        "scheduler": "^0.27.0"
      },
      "peerDependencies": {
        "react": "^19.2.8"
      }
    },
    "node_modules/rolldown": {
      "version": "1.2.3",
      "resolved": "https://registry.npmjs.org/rolldown/-/rolldown-1.2.3.tgz",
      "integrity": "sha512-rn9wpmxplLf7NLNyCk9FyWh3FM43DbY8jOzCdEPzH7uflhTftRbCEpqi6Ly2osgoU8OwObtmavMbWLaWy4LX7A==",
      "license": "MIT",
      "dependencies": {
        "@oxc-project/types": "=0.143.0",
        "@rolldown/pluginutils": "^1.0.0"
      },
      "bin": {
        "rolldown": "bin/cli.mjs"
      },
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      },
      "optionalDependencies": {
        "@rolldown/binding-android-arm64": "1.2.3",
        "@rolldown/binding-darwin-arm64": "1.2.3",
        "@rolldown/binding-darwin-x64": "1.2.3",
        "@rolldown/binding-freebsd-x64": "1.2.3",
        "@rolldown/binding-linux-arm-gnueabihf": "1.2.3",
        "@rolldown/binding-linux-arm64-gnu": "1.2.3",
        "@rolldown/binding-linux-arm64-musl": "1.2.3",
        "@rolldown/binding-linux-ppc64-gnu": "1.2.3",
        "@rolldown/binding-linux-s390x-gnu": "1.2.3",
        "@rolldown/binding-linux-x64-gnu": "1.2.3",
        "@rolldown/binding-linux-x64-musl": "1.2.3",
        "@rolldown/binding-openharmony-arm64": "1.2.3",
        "@rolldown/binding-win32-arm64-msvc": "1.2.3",
        "@rolldown/binding-win32-x64-msvc": "1.2.3"
      }
    },
    "node_modules/scheduler": {
      "version": "0.27.0",
      "resolved": "https://registry.npmjs.org/scheduler/-/scheduler-0.27.0.tgz",
      "integrity": "sha512-eNv+WrVbKu1f3vbYJT/xtiF5syA5HPIMtf9IgY/nKg0sWqzAUEvqY/xm7OcZc/qafLx/iO9FgOmeSAp4v5ti/Q==",
      "license": "MIT"
    },
    "node_modules/source-map-js": {
      "version": "1.2.1",
      "resolved": "https://registry.npmjs.org/source-map-js/-/source-map-js-1.2.1.tgz",
      "integrity": "sha512-UXWMKhLOwVKb728IUtQPXxfYU+usdybtUrK/8uGE8CQMvrhOpwvzDBwj0QhSL7MQc7vIsISBG8VQ8+IDQxpfQA==",
      "license": "BSD-3-Clause",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/tailwindcss": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/tailwindcss/-/tailwindcss-4.3.3.tgz",
      "integrity": "sha512-gOhV3P7ufE62QDGg1zVaTgCR+EtPv92k2nIhVcVKcLmxT1sUBsQGhnZj175j+MqRt4zLF7ic+sCYjfhxMxj7YQ==",
      "license": "MIT"
    },
    "node_modules/tapable": {
      "version": "2.3.3",
      "resolved": "https://registry.npmjs.org/tapable/-/tapable-2.3.3.tgz",
      "integrity": "sha512-uxc/zpqFg6x7C8vOE7lh6Lbda8eEL9zmVm/PLeTPBRhh1xCgdWaQ+J1CUieGpIfm2HdtsUpRv+HshiasBMcc6A==",
      "license": "MIT",
      "engines": {
        "node": ">=6"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/webpack"
      }
    },
    "node_modules/tinyglobby": {
      "version": "0.2.17",
      "resolved": "https://registry.npmjs.org/tinyglobby/-/tinyglobby-0.2.17.tgz",
      "integrity": "sha512-wXR/dYpcqKmfWpEdZjiKJOwCNFndD0DMnrW/cYjVGttEkBfVgcLFHoNrlj47mjOVic9yyNu65alsgF4NQyTa2g==",
      "license": "MIT",
      "dependencies": {
        "fdir": "^6.5.0",
        "picomatch": "^4.0.4"
      },
      "engines": {
        "node": ">=12.0.0"
      },
      "funding": {
        "url": "https://github.com/sponsors/SuperchupuDev"
      }
    },
    "node_modules/typescript": {
      "version": "6.0.3",
      "resolved": "https://registry.npmjs.org/typescript/-/typescript-6.0.3.tgz",
      "integrity": "sha512-y2TvuxSZPDyQakkFRPZHKFm+KKVqIisdg9/CZwm9ftvKXLP8NRWj38/ODjNbr43SsoXqNuAisEf1GdCxqWcdBw==",
      "dev": true,
      "license": "Apache-2.0",
      "bin": {
        "tsc": "bin/tsc",
        "tsserver": "bin/tsserver"
      },
      "engines": {
        "node": ">=14.17"
      }
    },
    "node_modules/undici-types": {
      "version": "7.18.2",
      "resolved": "https://registry.npmjs.org/undici-types/-/undici-types-7.18.2.tgz",
      "integrity": "sha512-AsuCzffGHJybSaRrmr5eHr81mwJU3kjw6M+uprWvCXiNeN9SOGwQ3Jn8jb8m3Z6izVgknn1R0FTCEAP2QrLY/w==",
      "devOptional": true,
      "license": "MIT"
    },
    "node_modules/vite": {
      "version": "8.2.1",
      "resolved": "https://registry.npmjs.org/vite/-/vite-8.2.1.tgz",
      "integrity": "sha512-EU/eS7BH3XROHh2YnBefjM6DBKA6ZeMZEYQbj7NLWg5wHYlhB8B/Mayd5XsgWq+NFYccDOTemRpdETWR6Ka/lw==",
      "license": "MIT",
      "dependencies": {
        "lightningcss": "^1.33.0",
        "picomatch": "^4.0.5",
        "postcss": "^8.5.25",
        "rolldown": "~1.2.1",
        "tinyglobby": "^0.2.17"
      },
      "bin": {
        "vite": "bin/vite.js"
      },
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      },
      "funding": {
        "url": "https://github.com/vitejs/vite?sponsor=1"
      },
      "optionalDependencies": {
        "fsevents": "~2.3.3"
      },
      "peerDependencies": {
        "@types/node": "^20.19.0 || >=22.12.0",
        "@vitejs/devtools": "^0.4.0",
        "esbuild": "^0.27.0 || ^0.28.0",
        "jiti": ">=1.21.0",
        "less": "^4.0.0",
        "sass": "^1.70.0",
        "sass-embedded": "^1.70.0",
        "stylus": ">=0.54.8",
        "sugarss": "^5.0.0",
        "terser": "^5.16.0",
        "tsx": "^4.8.1",
        "yaml": "^2.4.2"
      },
      "peerDependenciesMeta": {
        "@types/node": {
          "optional": true
        },
        "@vitejs/devtools": {
          "optional": true
        },
        "esbuild": {
          "optional": true
        },
        "jiti": {
          "optional": true
        },
        "less": {
          "optional": true
        },
        "sass": {
          "optional": true
        },
        "sass-embedded": {
          "optional": true
        },
        "stylus": {
          "optional": true
        },
        "sugarss": {
          "optional": true
        },
        "terser": {
          "optional": true
        },
        "tsx": {
          "optional": true
        },
        "yaml": {
          "optional": true
        }
      }
    }
  }
}
```

**Someday/package.json**

프로젝트 이름, 버전, 스크립트 실행 명령어(dev, build, lint) 및 설치된 주요 의존성 패키지(React, Vite, Tailwind CSS 등)를 명시한 기본 설정 파일입니다.

```json
{
  "name": "someday",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "oxlint",
    "preview": "vite preview"
  },
  "dependencies": {
    "@tailwindcss/vite": "^4.3.3",
    "date-fns": "^4.4.0",
    "lucide-react": "^1.29.0",
    "react": "^19.2.8",
    "react-dom": "^19.2.8",
    "tailwindcss": "^4.3.3"
  },
  "devDependencies": {
    "@types/node": "^24.13.3",
    "@types/react": "^19.2.17",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.4",
    "oxlint": "^1.75.0",
    "typescript": "~6.0.2",
    "vite": "^8.2.0"
  }
}
```

**Someday/tsconfig.app.json**

애플리케이션 클라이언트 소스 코드(src)에 적용되는 TypeScript 컴파일러 상세 옵션 설정 파일입니다.

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "es2023",
    "lib": ["ES2023", "DOM"],
    "module": "esnext",
    "types": ["vite/client"],
    "allowArbitraryExtensions": true,
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

**Someday/tsconfig.json**

TypeScript 설정의 최상위 루트 파일로, 앱(tsconfig.app.json) 및 Node(tsconfig.node.json) 설정 파일을 각각 참조하도록 통합 관리합니다.

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

**Someday/tsconfig.node.json**

Vite 빌드 설정 파일(vite.config.ts)과 같은 Node.js 환경에서 실행되는 도구용 TypeScript 컴파일러 설정 파일입니다.

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "es2023",
    "lib": ["ES2023"],
    "types": ["node"],
    "skipLibCheck": true,

    /* Bundler mode */
    "module": "nodenext",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,

    /* Linting */
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["vite.config.ts"]
}
```

**Someday/vite.config.ts**

Vite 번들러 설정 파일입니다. React 개발용 플러그인과 Tailwind CSS 플러그인을 설정하고 개발 서버의 포트 구성을 정의합니다.

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // 로컬 미리보기 도구가 5173을 다른 프로세스가 점유했을 때 PORT 환경변수로
    // 대체 포트를 지정할 수 있도록 한다. 지정이 없으면 기본값 5173을 사용한다.
    port: Number(process.env.PORT) || 5173,
  },
})
```

**Someday/src/App.tsx**

애플리케이션의 메인 React 컴포넌트입니다. 데모 데이터를 포함한 초기 상태 관리, 버킷 카드 및 필터/요약 바 컴포넌트들을 조합하여 전체 메인 레이아웃을 구성합니다.

```typescript
import { Compass } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import BucketCard from "./components/BucketCard";
import BucketForm from "./components/BucketForm";
import FilterBar from "./components/FilterBar";
import SummaryBar from "./components/SummaryBar";
import { loadBuckets, saveBuckets } from "./storage/bucketStorage";
import type { Bucket, BucketCategory, BucketStatus } from "./types/bucket";
import { filterBuckets, sortBuckets, type SortOption } from "./utils/filterSort";

// 더미 데이터의 사진 필드용 예시 이미지. Picsum(무료 플레이스홀더 사진 서비스)의
// 고정 시드 URL을 사용해 새로고침해도 항상 같은 사진이 보이도록 한다.
// 데모 데이터에 한해서만 쓰는 외부 링크이며, 실제 사진 첨부 기능은 FileReader로
// 읽어 base64로 저장하므로 계속 완전히 로컬에서 동작한다.
function demoPhoto(seed: string): string {
  return `https://picsum.photos/seed/${seed}/600/400`;
}

// localStorage가 비어있는 첫 방문 상태에서 화면 구성을 바로 확인할 수 있도록 넣는 예시 데이터.
// 실제 사용자가 한 건이라도 등록 · 삭제하면 그 이후로는 이 시드가 다시 채워지지 않는다.
function createDemoBuckets(): Bucket[] {
  const now = new Date().toISOString();
  return [
    {
      id: crypto.randomUUID(),
      title: "홋카이도 눈축제 가기",
      category: "여행",
      targetDate: "2027-02-05",
      importance: "상",
      memo: "삿포로 눈축제 시즌에 맞춰 다녀오기",
      status: "계획 중",
      favorite: true,
      photo: demoPhoto("hokkaido-snow-festival"),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      title: "하프 마라톤 완주하기",
      category: "운동",
      targetDate: "2026-10-18",
      importance: "중",
      memo: "매주 3회 이상 5km 러닝 연습",
      status: "진행 중",
      favorite: false,
      photo: demoPhoto("half-marathon-run"),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      title: "손글씨로 편지 쓰기",
      category: "취미",
      importance: "하",
      status: "완료",
      favorite: false,
      completedAt: now,
      review: "오랜만에 손으로 편지를 쓰니 생각보다 마음이 차분해졌다.",
      photo: demoPhoto("handwritten-letter"),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      title: "번지점프 도전하기",
      category: "도전",
      targetDate: "2026-08-12",
      importance: "상",
      memo: "고소공포증부터 극복하고 뛰어보기",
      status: "계획 중",
      favorite: true,
      photo: demoPhoto("bungee-jump"),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      title: "기타 연주 배우기",
      category: "학습",
      targetDate: "2026-12-20",
      importance: "중",
      memo: "온라인 강의로 좋아하는 노래 코드 3개 익히기",
      status: "진행 중",
      favorite: false,
      photo: demoPhoto("guitar-lesson"),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      title: "오마카세 먹어보기",
      category: "음식",
      importance: "하",
      status: "완료",
      favorite: false,
      completedAt: now,
      review: "가격은 부담스러웠지만 그만한 값어치가 있었다.",
      photo: demoPhoto("omakase-sushi"),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      title: "동네 도서관 회원증 만들기",
      category: "기타",
      memo: "산책 겸 걸어가서 만들고 책 한 권 빌려오기",
      status: "계획 중",
      favorite: false,
      photo: demoPhoto("library-books"),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      title: "국토 자전거 종주하기",
      category: "여행",
      targetDate: "2026-07-20",
      importance: "중",
      memo: "4대강 종주 코스 완주 인증하기",
      status: "진행 중",
      favorite: false,
      photo: demoPhoto("cycling-korea"),
      createdAt: now,
      updatedAt: now,
    },
  ];
}

/**
 * 전체 화면 구성 및 상태 관리 시작점.
 * buckets 배열은 localStorage(bucketStorage)와 동기화되어 새로고침해도 유지된다.
 * 등록 · 상태 변경 · 완료 후기 · 수정 · 삭제 · 즐겨찾기 · 검색/필터/정렬을 모두 여기서 오케스트레이션한다.
 */
function App() {
  const [buckets, setBuckets] = useState<Bucket[]>(() => {
    const stored = loadBuckets();
    return stored.length > 0 ? stored : createDemoBuckets();
  });
  const [editingBucket, setEditingBucket] = useState<Bucket | null>(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<BucketCategory | "전체">("전체");
  const [statusFilter, setStatusFilter] = useState<BucketStatus | "전체">("전체");
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("createdAt");

  // buckets가 바뀔 때마다(등록 · 수정 · 삭제 · 상태 변경 등) localStorage에 반영한다.
  useEffect(() => {
    saveBuckets(buckets);
  }, [buckets]);

  const handleAddBucket = (bucket: Bucket) => {
    setBuckets((prev) => [...prev, bucket]);
  };

  const handleUpdateBucket = (updated: Bucket) => {
    setBuckets((prev) => prev.map((bucket) => (bucket.id === updated.id ? updated : bucket)));
    setEditingBucket(null);
  };

  const handleStatusChange = (id: string, status: BucketStatus) => {
    const now = new Date().toISOString();
    setBuckets((prev) =>
      prev.map((bucket) => {
        if (bucket.id !== id) return bucket;
        if (status === "완료") {
          return { ...bucket, status, completedAt: bucket.completedAt ?? now, updatedAt: now };
        }
        // 완료에서 되돌리면 완료 날짜는 지우되, 이미 작성한 후기는 그대로 둔다.
        return { ...bucket, status, completedAt: undefined, updatedAt: now };
      }),
    );
  };

  const handleToggleFavorite = (id: string) => {
    const now = new Date().toISOString();
    setBuckets((prev) =>
      prev.map((bucket) => (bucket.id === id ? { ...bucket, favorite: !bucket.favorite, updatedAt: now } : bucket)),
    );
  };

  const handleSaveReview = (id: string, review: string) => {
    const now = new Date().toISOString();
    setBuckets((prev) =>
      prev.map((bucket) => {
        if (bucket.id !== id) return bucket;
        const next = { ...bucket, updatedAt: now };
        if (review) next.review = review;
        else delete next.review;
        return next;
      }),
    );
  };

  const handleDelete = (id: string) => {
    setBuckets((prev) => prev.filter((bucket) => bucket.id !== id));
    if (editingBucket?.id === id) setEditingBucket(null);
  };

  const visibleBuckets = useMemo(() => {
    const filtered = filterBuckets(buckets, { search, category: categoryFilter, status: statusFilter, favoriteOnly });
    return sortBuckets(filtered, sortOption);
  }, [buckets, search, categoryFilter, statusFilter, favoriteOnly, sortOption]);

  const hasAnyBuckets = buckets.length > 0;
  const hasVisibleBuckets = visibleBuckets.length > 0;

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-12">
        <header className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
              <Compass className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-ink-faint">
                Personal Archive
              </p>
              <h1 className="font-serif text-2xl font-semibold text-ink">Someday</h1>
            </div>
          </div>
          <p className="text-sm text-ink-soft">
            언젠가 해보고 싶은 일들을 모아, 이뤄가는 순간까지 기록해보세요.
          </p>
        </header>

        {/* 등록된 버킷이 없을 때는 통계보다 첫 등록 행동이 먼저 보이도록 요약 영역을 숨긴다. */}
        {hasAnyBuckets && <SummaryBar buckets={buckets} />}

        <BucketForm
          onAdd={handleAddBucket}
          onUpdate={handleUpdateBucket}
          editingBucket={editingBucket}
          onCancelEdit={() => setEditingBucket(null)}
        />

        <FilterBar
          search={search}
          onSearchChange={setSearch}
          category={categoryFilter}
          onCategoryChange={setCategoryFilter}
          status={statusFilter}
          onStatusChange={setStatusFilter}
          sort={sortOption}
          onSortChange={setSortOption}
          favoriteOnly={favoriteOnly}
          onToggleFavoriteOnly={() => setFavoriteOnly((prev) => !prev)}
        />

        {!hasAnyBuckets && (
          <section className="flex flex-col items-center gap-2 rounded-2xl bg-surface-soft px-6 py-14 text-center">
            <Compass className="h-6 w-6 text-accent" />
            <p className="text-base font-medium text-ink">아직 남긴 Someday가 없어요.</p>
            <p className="text-sm text-ink-soft">
              위에서 제목만 적어도 괜찮아요 — 첫 번째 버킷을 남겨보세요.
            </p>
          </section>
        )}

        {hasAnyBuckets && !hasVisibleBuckets && (
          <section className="flex flex-col items-center gap-2 rounded-2xl bg-surface-soft px-6 py-14 text-center">
            <p className="text-base font-medium text-ink">조건에 맞는 버킷이 없어요.</p>
            <p className="text-sm text-ink-soft">검색어나 필터를 확인해보세요.</p>
          </section>
        )}

        {hasVisibleBuckets && (
          <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2">
            {visibleBuckets.map((bucket) => (
              <BucketCard
                key={bucket.id}
                bucket={bucket}
                onStatusChange={handleStatusChange}
                onToggleFavorite={handleToggleFavorite}
                onEdit={setEditingBucket}
                onDelete={handleDelete}
                onSaveReview={handleSaveReview}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
```

**Someday/src/index.css**

```css
@import "tailwindcss";

/*
 * Someday 디자인 토큰.
 * "따뜻하고 감성적이지만 과하지 않은 개인 라이프 아카이브" 톤을 위해
 * 회색/보라 위주 팔레트 대신 종이 질감의 웜톤 + 테라코타 포인트를 사용한다.
 * Tailwind v4의 CSS 기반 테마 방식(@theme)으로 선언하면
 * bg-paper, text-ink, border-line 같은 유틸리티 클래스가 자동으로 생성된다.
 */
@theme {
  --color-paper: #faf6ef; /* 페이지 배경 */
  --color-surface: #ffffff; /* 등록 폼 · 카드 등 주요 콘텐츠 표면 */
  --color-surface-soft: #f2ebdf; /* 요약 · 필터 등 보조 영역 표면 */
  --color-ink: #2b241e; /* 기본 텍스트 */
  --color-ink-soft: #77695c; /* 보조 텍스트 */
  --color-ink-faint: #a89a8a; /* placeholder, 비활성 텍스트 */
  --color-line: #e7dbc8; /* 테두리 */
  --color-accent: #b5562f; /* 포인트 색상(등록 버튼, 강조) */
  --color-accent-soft: #f3ddcb; /* 카테고리 배지 등 포인트 배경 */
  --color-progress: #4f7585; /* "진행 중" 상태 */
  --color-progress-soft: #e1e9ea;
  --color-done: #5f7d4c; /* "완료" 상태 */
  --color-done-soft: #e4ead9;
}

body {
  margin: 0;
  background-color: var(--color-paper);
  color: var(--color-ink);
}
```

**Someday/src/main.tsx**

```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

**Someday/src/utils/date.ts**

```typescript
import { differenceInCalendarDays, parseISO } from "date-fns";
import type { Bucket } from "../types/bucket";

export type DDayDisplay =
  | { tone: "overdue"; label: "목표일 지남" }
  | { tone: "urgent" | "normal"; label: string };

/**
 * 버킷의 목표일 기반 D-Day 표시를 계산한다.
 * - 목표일이 없으면 null (표시하지 않음)
 * - 완료된 버킷은 "목표일 지남" 경고를 보여줄 필요가 없으므로 null
 * - 시각(시·분·초)이 아니라 로컬 달력 날짜 기준으로 차이를 계산한다.
 */
export function getDDayDisplay(bucket: Bucket): DDayDisplay | null {
  if (!bucket.targetDate || bucket.status === "완료") return null;

  const diff = differenceInCalendarDays(parseISO(bucket.targetDate), new Date());

  if (diff < 0) return { tone: "overdue", label: "목표일 지남" };
  if (diff === 0) return { tone: "urgent", label: "D-Day" };
  return { tone: diff <= 7 ? "urgent" : "normal", label: `D-${diff}` };
}
```

**Someday/src/utils/filterSort.ts**

```typescript
import type { Bucket, BucketCategory, BucketStatus } from "../types/bucket";

export type SortOption = "createdAt" | "targetDate" | "importance";
export type CategoryFilter = BucketCategory | "전체";
export type StatusFilter = BucketStatus | "전체";

interface FilterOptions {
  search: string;
  category: CategoryFilter;
  status: StatusFilter;
  favoriteOnly: boolean;
}

/** 검색어(제목 · 카테고리) · 카테고리 필터 · 상태 필터 · 즐겨찾기 필터를 동시에 적용한다. */
export function filterBuckets(buckets: Bucket[], { search, category, status, favoriteOnly }: FilterOptions): Bucket[] {
  const query = search.trim().toLowerCase();

  return buckets.filter((bucket) => {
    if (query) {
      const inTitle = bucket.title.toLowerCase().includes(query);
      const inCategory = (bucket.category ?? "").toLowerCase().includes(query);
      if (!inTitle && !inCategory) return false;
    }
    if (category !== "전체" && bucket.category !== category) return false;
    if (status !== "전체" && bucket.status !== status) return false;
    if (favoriteOnly && !bucket.favorite) return false;
    return true;
  });
}

const IMPORTANCE_ORDER: Record<string, number> = { 상: 0, 중: 1, 하: 2 };

/**
 * 목표일순 · 중요도순 · 등록순 정렬.
 * - 목표일순: 목표일이 없는 항목은 뒤로 보낸다.
 * - 중요도순: 상 → 중 → 하 → 미설정 순서로 정렬한다.
 * - 등록순: createdAt(ISO 문자열) 오름차순 — 원본 배열을 바꾸지 않는다.
 */
export function sortBuckets(buckets: Bucket[], option: SortOption): Bucket[] {
  const sorted = [...buckets];

  if (option === "targetDate") {
    return sorted.sort((a, b) => {
      if (!a.targetDate && !b.targetDate) return 0;
      if (!a.targetDate) return 1;
      if (!b.targetDate) return -1;
      return a.targetDate.localeCompare(b.targetDate);
    });
  }

  if (option === "importance") {
    return sorted.sort((a, b) => {
      const aValue = a.importance ? IMPORTANCE_ORDER[a.importance] : 3;
      const bValue = b.importance ? IMPORTANCE_ORDER[b.importance] : 3;
      return aValue - bValue;
    });
  }

  return sorted.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}
```

**Someday/src/utils/image.ts**

```typescript
// 사진 첨부(추가 기능)에서 사용하는 이미지 처리 유틸.
// FileReader로 파일을 읽고, canvas로 리사이즈해 localStorage 용량 문제를 줄인다.

const MAX_DIMENSION = 800; // 가로/세로 중 긴 쪽을 이 값 이하로 축소한다.
const JPEG_QUALITY = 0.75;

/**
 * 이미지 파일을 읽어 긴 변 기준 MAX_DIMENSION 이하로 축소한 뒤,
 * base64 JPEG 데이터 URL로 변환한다. 원본이 이미 작으면 그대로 축소 없이 반환한다.
 */
export function readAndResizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("이미지 파일을 읽지 못했습니다."));
    reader.onload = () => {
      const img = new Image();

      img.onerror = () => reject(new Error("이미지를 불러오지 못했습니다."));
      img.onload = () => {
        const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
        const targetWidth = Math.round(img.width * scale);
        const targetHeight = Math.round(img.height * scale);

        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("이미지를 처리할 수 없습니다."));
          return;
        }

        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
      };

      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
}
```

**Someday/src/types/bucket.ts**

```typescript
// 버킷 데이터 타입 정의 (PROJECT_PLAN.md 11. 데이터 구조 기준)

export type BucketCategory =
  | "여행"
  | "취미"
  | "도전"
  | "학습"
  | "운동"
  | "음식"
  | "기타";

export type BucketImportance = "상" | "중" | "하";

export type BucketStatus = "계획 중" | "진행 중" | "완료";

export interface Bucket {
  id: string; // 버킷을 구분하는 고유 식별자 (항상 존재, 등록 시 crypto.randomUUID()로 생성)
  title: string; // 하고 싶은 일 제목 (필수 입력, 항상 존재)
  category?: BucketCategory; // 카테고리 (선택 입력)
  targetDate?: string; // 목표일 (선택 입력) — YYYY-MM-DD 형식
  importance?: BucketImportance; // 중요도 (선택 입력)
  memo?: string; // 메모 (선택 입력)
  status: BucketStatus; // 상태 (등록 시 "계획 중"으로 자동 설정, 항상 존재)
  completedAt?: string; // 완료 처리 시 기록되는 날짜/시간 (완료 상태일 때만 값 존재), ISO 8601 형식
  review?: string; // 완료 후 후기 (선택 작성)
  photo?: string; // 사진 데이터 (base64 문자열) — 추가 기능에서만 사용
  favorite: boolean; // 즐겨찾기 여부 (항상 존재, 기본값 false)
  createdAt: string; // 생성 시각 (항상 존재), ISO 8601 형식
  updatedAt: string; // 마지막 수정 시각 (항상 존재), ISO 8601 형식
}

// 카테고리 필터 등에서 사용할 전체 카테고리 목록
export const BUCKET_CATEGORIES: BucketCategory[] = [
  "여행",
  "취미",
  "도전",
  "학습",
  "운동",
  "음식",
  "기타",
];

// 중요도 선택 목록
export const BUCKET_IMPORTANCES: BucketImportance[] = ["상", "중", "하"];

// 상태 선택 목록
export const BUCKET_STATUSES: BucketStatus[] = ["계획 중", "진행 중", "완료"];
```

**Someday/src/storage/bucketStorage.ts**

```typescript
import type { Bucket } from "../types/bucket";

// localStorage에 버킷 목록을 저장할 때 사용하는 키
const STORAGE_KEY = "someday:buckets";

/**
 * localStorage에 저장된 버킷 목록을 불러온다.
 * 저장된 값이 없거나 형식이 올바르지 않으면 빈 배열을 반환한다.
 */
export function loadBuckets(): Bucket[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Bucket[]) : [];
  } catch (error) {
    console.error("버킷 목록을 불러오지 못했습니다.", error);
    return [];
  }
}

/**
 * 버킷 목록 전체를 localStorage에 저장한다.
 * 등록 · 수정 · 삭제 · 상태 변경 등으로 buckets 배열이 바뀔 때마다
 * App.tsx에서 호출해 localStorage와 동기화한다.
 */
export function saveBuckets(buckets: Bucket[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(buckets));
  } catch (error) {
    console.error("버킷 목록을 저장하지 못했습니다.", error);
  }
}
```

**Someday/src/components/BucketCard.tsx**

```typescript
import { Calendar, CheckCircle2, Heart, Pencil, Star, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { Bucket, BucketImportance, BucketStatus } from "../types/bucket";
import { BUCKET_STATUSES } from "../types/bucket";
import { getDDayDisplay } from "../utils/date";

interface BucketCardProps {
  bucket: Bucket;
  onStatusChange: (id: string, status: BucketStatus) => void;
  onToggleFavorite: (id: string) => void;
  onEdit: (bucket: Bucket) => void;
  onDelete: (id: string) => void;
  onSaveReview: (id: string, review: string) => void;
}

// 상태별 배지 스타일 (13단계에서 최종 디자인을 다시 다듬을 예정)
const STATUS_BADGE_STYLE: Record<BucketStatus, string> = {
  "계획 중": "bg-surface-soft text-ink-soft",
  "진행 중": "bg-progress-soft text-progress",
  완료: "bg-done-soft text-done",
};

// 카드 배경도 상태에 따라 아주 옅게 톤을 다르게 준다.
const CARD_SURFACE_STYLE: Record<BucketStatus, string> = {
  "계획 중": "bg-surface border-line",
  "진행 중": "bg-surface border-progress/30",
  완료: "bg-done-soft/40 border-done/30",
};

const DDAY_TEXT_STYLE: Record<"urgent" | "normal" | "overdue", string> = {
  urgent: "text-accent",
  normal: "text-ink-soft",
  overdue: "text-rose-600",
};

// 중요도(상 · 중 · 하)를 별 3개 중 몇 개를 채울지로 표현한다.
const IMPORTANCE_LEVEL: Record<BucketImportance, number> = { 상: 3, 중: 2, 하: 1 };

/** 완료된 버킷의 후기를 입력 · 저장하는 카드 내부 인라인 편집기. */
function ReviewEditor({ bucket, onSave }: { bucket: Bucket; onSave: (id: string, review: string) => void }) {
  const [text, setText] = useState(bucket.review ?? "");

  useEffect(() => {
    setText(bucket.review ?? "");
  }, [bucket.id, bucket.review]);

  return (
    <div className="flex flex-col gap-2 rounded-lg bg-done-soft p-3">
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="완료 후기를 남겨보세요 (예: 생각보다 훨씬 재밌었다)"
        rows={2}
        className="resize-none rounded-md border border-done/30 bg-surface px-2 py-1.5 text-sm text-ink placeholder:text-ink-faint focus:border-done focus:outline-none"
      />
      <button
        type="button"
        onClick={() => onSave(bucket.id, text.trim())}
        className="self-start rounded-md bg-done px-3 py-1 text-xs font-medium text-white hover:bg-done/90"
      >
        후기 저장
      </button>
    </div>
  );
}

/**
 * 버킷 한 건을 카드 형태로 보여주는 컴포넌트.
 * 상태 변경 · 즐겨찾기 · 수정 · 삭제 · 후기 저장을 모두 이 카드에서 처리한다.
 */
function BucketCard({ bucket, onStatusChange, onToggleFavorite, onEdit, onDelete, onSaveReview }: BucketCardProps) {
  const dDay = getDDayDisplay(bucket);

  return (
    <div className={`flex h-full flex-col gap-3 rounded-2xl border p-5 shadow-sm ${CARD_SURFACE_STYLE[bucket.status]}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1.5">
          {bucket.category && (
            <span className="w-fit rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent">
              {bucket.category}
            </span>
          )}
          <h3 className="flex items-center gap-1.5 font-serif text-base font-semibold leading-snug text-ink">
            {bucket.status === "완료" && <CheckCircle2 className="h-4 w-4 shrink-0 text-done" />}
            {bucket.title}
          </h3>
        </div>
        <button
          type="button"
          onClick={() => onToggleFavorite(bucket.id)}
          aria-label="즐겨찾기"
          aria-pressed={bucket.favorite}
          className={`shrink-0 ${bucket.favorite ? "text-accent" : "text-ink-faint hover:text-accent"}`}
        >
          <Heart className="h-5 w-5" fill={bucket.favorite ? "currentColor" : "none"} />
        </button>
      </div>

      {bucket.photo && (
        <img
          src={bucket.photo}
          alt={`${bucket.title} 사진`}
          className="h-40 w-full rounded-xl object-cover"
        />
      )}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-ink-soft">
        <select
          value={bucket.status}
          onChange={(event) => onStatusChange(bucket.id, event.target.value as BucketStatus)}
          className={`rounded-full border-none px-2 py-0.5 text-xs font-medium focus:outline-none ${STATUS_BADGE_STYLE[bucket.status]}`}
        >
          {BUCKET_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        {bucket.importance && (
          <span className="inline-flex items-center gap-0.5" aria-label={`중요도 ${bucket.importance}`}>
            {[1, 2, 3].map((level) => (
              <Star
                key={level}
                className={`h-3.5 w-3.5 ${
                  level <= IMPORTANCE_LEVEL[bucket.importance!] ? "fill-accent text-accent" : "text-line"
                }`}
              />
            ))}
          </span>
        )}

        {bucket.targetDate && (
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {bucket.targetDate}
          </span>
        )}

        {dDay && <span className={`text-xs font-semibold ${DDAY_TEXT_STYLE[dDay.tone]}`}>{dDay.label}</span>}
      </div>

      {bucket.memo && <p className="text-sm leading-relaxed text-ink-soft">{bucket.memo}</p>}

      {bucket.status === "완료" && (
        <div className="flex flex-col gap-2">
          {bucket.completedAt && (
            <p className="text-xs font-medium text-done">
              완료일 {bucket.completedAt.slice(0, 10)}
            </p>
          )}
          <ReviewEditor bucket={bucket} onSave={onSaveReview} />
        </div>
      )}

      {/* 내용 길이가 카드마다 달라도 액션 영역은 항상 하단에 고정된다. */}
      <div className="mt-auto flex justify-end gap-4 pt-2 text-sm text-ink-faint">
        <button
          type="button"
          onClick={() => onEdit(bucket)}
          className="inline-flex items-center gap-1 hover:text-ink"
        >
          <Pencil className="h-4 w-4" />
          수정
        </button>
        <button
          type="button"
          onClick={() => {
            if (window.confirm(`"${bucket.title}"을(를) 삭제할까요?`)) {
              onDelete(bucket.id);
            }
          }}
          className="inline-flex items-center gap-1 hover:text-rose-600"
        >
          <Trash2 className="h-4 w-4" />
          삭제
        </button>
      </div>
    </div>
  );
}

export default BucketCard;
```

**Someday/src/components/BucketForm.tsx**

```typescript
import { ImagePlus, X } from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import {
  BUCKET_CATEGORIES,
  BUCKET_IMPORTANCES,
  type Bucket,
  type BucketCategory,
  type BucketImportance,
} from "../types/bucket";
import { readAndResizeImage } from "../utils/image";

interface BucketFormProps {
  /** 새로 생성된 버킷을 상위(App)로 전달한다. localStorage 반영은 App의 useEffect가 담당한다. */
  onAdd: (bucket: Bucket) => void;
  /** 수정 모드에서 저장 버튼을 눌렀을 때 호출된다. */
  onUpdate: (bucket: Bucket) => void;
  /** 수정 중인 버킷. null이면 등록 모드로 동작한다. */
  editingBucket: Bucket | null;
  /** 수정을 취소하고 등록 모드로 되돌린다. */
  onCancelEdit: () => void;
}

/**
 * 버킷 등록 · 수정 폼. editingBucket이 있으면 그 값으로 필드를 채우고
 * 제출 시 onUpdate를, 없으면 onAdd를 호출한다(같은 폼을 그대로 재사용).
 * 제목만 필수로 입력받고, 나머지 항목은 선택 입력으로 둔다.
 */
function BucketForm({ onAdd, onUpdate, editingBucket, onCancelEdit }: BucketFormProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<BucketCategory | "">("");
  const [targetDate, setTargetDate] = useState("");
  const [importance, setImportance] = useState<BucketImportance | "">("");
  const [memo, setMemo] = useState("");
  const [photo, setPhoto] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = editingBucket !== null;

  // 수정 대상이 바뀌면 폼 필드를 그 값으로 채우고, 취소되면 등록 모드로 비운다.
  useEffect(() => {
    if (editingBucket) {
      setTitle(editingBucket.title);
      setCategory(editingBucket.category ?? "");
      setTargetDate(editingBucket.targetDate ?? "");
      setImportance(editingBucket.importance ?? "");
      setMemo(editingBucket.memo ?? "");
      setPhoto(editingBucket.photo ?? "");
      setPhotoError("");
      setError("");
    } else {
      setTitle("");
      setCategory("");
      setTargetDate("");
      setImportance("");
      setMemo("");
      setPhoto("");
      setPhotoError("");
      setError("");
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [editingBucket]);

  // 사진 파일을 선택하면 읽어서 축소한 뒤 미리보기(base64)로 저장한다.
  const handlePhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setPhotoError("이미지 파일만 첨부할 수 있어요.");
      event.target.value = "";
      return;
    }

    setPhotoError("");
    setIsProcessingPhoto(true);
    try {
      const resized = await readAndResizeImage(file);
      setPhoto(resized);
    } catch {
      setPhotoError("사진을 처리하지 못했어요. 다른 사진으로 시도해주세요.");
    } finally {
      setIsProcessingPhoto(false);
      event.target.value = "";
    }
  };

  const handleRemovePhoto = () => {
    setPhoto("");
    setPhotoError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("제목을 입력해주세요.");
      return;
    }

    const now = new Date().toISOString();
    const trimmedMemo = memo.trim();

    if (isEditing && editingBucket) {
      const updated: Bucket = {
        ...editingBucket,
        title: trimmedTitle,
        updatedAt: now,
      };
      delete updated.category;
      delete updated.targetDate;
      delete updated.importance;
      delete updated.memo;
      delete updated.photo;

      onUpdate({
        ...updated,
        ...(category && { category }),
        ...(targetDate && { targetDate }),
        ...(importance && { importance }),
        ...(trimmedMemo && { memo: trimmedMemo }),
        ...(photo && { photo }),
      });
      return;
    }

    const newBucket: Bucket = {
      id: crypto.randomUUID(),
      title: trimmedTitle,
      status: "계획 중",
      favorite: false,
      createdAt: now,
      updatedAt: now,
      ...(category && { category }),
      ...(targetDate && { targetDate }),
      ...(importance && { importance }),
      ...(trimmedMemo && { memo: trimmedMemo }),
      ...(photo && { photo }),
    };

    onAdd(newBucket);

    setTitle("");
    setCategory("");
    setTargetDate("");
    setImportance("");
    setMemo("");
    setPhoto("");
    setPhotoError("");
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-7"
    >
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.15em] text-accent">
          {isEditing ? "Someday 수정" : "Someday 등록"}
        </p>
        <h2 className="mt-1 font-serif text-lg font-semibold text-ink">
          {isEditing ? "버킷 내용을 고쳐볼까요?" : "오늘, 어떤 걸 해보고 싶나요?"}
        </h2>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="title" className="text-sm font-medium text-ink">
          제목 <span className="text-rose-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            if (error) setError("");
          }}
          placeholder="하고 싶은 일을 입력하세요"
          className={`rounded-lg border px-3 py-2.5 text-base text-ink placeholder:text-ink-faint focus:outline-none ${
            error ? "border-rose-400 focus:border-rose-400" : "border-line focus:border-accent"
          }`}
        />
        {error && <p className="text-xs text-rose-500">{error}</p>}
      </div>

      <div className="flex flex-col gap-3 border-t border-line pt-4">
        <p className="text-xs font-medium uppercase tracking-[0.1em] text-ink-faint">
          선택 입력 · 나중에 채워도 괜찮아요
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="category" className="text-sm text-ink-soft">
              카테고리
            </label>
            <select
              id="category"
              value={category}
              onChange={(event) => setCategory(event.target.value as BucketCategory | "")}
              className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
            >
              <option value="">선택 안 함</option>
              {BUCKET_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="targetDate" className="text-sm text-ink-soft">
              목표일
            </label>
            <input
              id="targetDate"
              type="date"
              value={targetDate}
              onChange={(event) => setTargetDate(event.target.value)}
              className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="importance" className="text-sm text-ink-soft">
              중요도
            </label>
            <select
              id="importance"
              value={importance}
              onChange={(event) => setImportance(event.target.value as BucketImportance | "")}
              className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
            >
              <option value="">선택 안 함</option>
              {BUCKET_IMPORTANCES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="memo" className="text-sm text-ink-soft">
            메모
          </label>
          <textarea
            id="memo"
            value={memo}
            onChange={(event) => setMemo(event.target.value)}
            placeholder="간단한 메모를 남겨보세요"
            rows={2}
            className="resize-none rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="photo" className="text-sm text-ink-soft">
            사진 (1장)
          </label>

          {photo ? (
            <div className="flex items-center gap-3">
              <img src={photo} alt="첨부한 사진 미리보기" className="h-20 w-20 rounded-lg object-cover" />
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="inline-flex items-center gap-1 rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink-soft hover:bg-surface-soft"
              >
                <X className="h-3.5 w-3.5" />
                사진 제거
              </button>
            </div>
          ) : (
            <label
              htmlFor="photo"
              className="flex w-fit cursor-pointer items-center gap-1.5 rounded-lg border border-dashed border-line px-3 py-2 text-sm text-ink-soft hover:border-accent hover:text-accent"
            >
              <ImagePlus className="h-4 w-4" />
              {isProcessingPhoto ? "처리 중..." : "사진 선택"}
            </label>
          )}

          <input
            id="photo"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            disabled={isProcessingPhoto}
            className="hidden"
          />
          {photoError && <p className="text-xs text-rose-500">{photoError}</p>}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent/90"
        >
          {isEditing ? "수정하기" : "등록하기"}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="rounded-lg border border-line px-5 py-2.5 text-sm font-medium text-ink-soft hover:bg-surface-soft"
          >
            취소
          </button>
        )}
      </div>
    </form>
  );
}

export default BucketForm;
```

**Someday/src/components/FilterBar.tsx**

```typescript
import { Heart, Search } from "lucide-react";
import { BUCKET_CATEGORIES, BUCKET_STATUSES, type BucketCategory, type BucketStatus } from "../types/bucket";

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  category: BucketCategory | "전체";
  onCategoryChange: (value: BucketCategory | "전체") => void;
  status: BucketStatus | "전체";
  onStatusChange: (value: BucketStatus | "전체") => void;
  sort: "createdAt" | "targetDate" | "importance";
  onSortChange: (value: "createdAt" | "targetDate" | "importance") => void;
  favoriteOnly: boolean;
  onToggleFavoriteOnly: () => void;
}

const CONTROL_STYLE =
  "rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none";

/**
 * 검색 · 카테고리 필터 · 상태 필터 · 정렬 · 즐겨찾기만 보기 · "이룬 것들" 보기를 담는 영역.
 * "이룬 것들"은 별도 로직 없이 상태 필터를 "완료"로 설정하는 방식으로 재사용한다.
 */
function FilterBar({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  status,
  onStatusChange,
  sort,
  onSortChange,
  favoriteOnly,
  onToggleFavoriteOnly,
}: FilterBarProps) {
  const showingCompletedOnly = status === "완료";

  return (
    <section className="flex flex-col gap-3 rounded-xl bg-surface-soft/60 p-4 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative flex-1 sm:min-w-[200px]">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
        <input
          type="text"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="제목 또는 카테고리 검색"
          className={`w-full py-2 pl-9 pr-3 ${CONTROL_STYLE}`}
        />
      </div>

      <select
        value={category}
        onChange={(event) => onCategoryChange(event.target.value as BucketCategory | "전체")}
        className={CONTROL_STYLE}
      >
        <option value="전체">전체 카테고리</option>
        {BUCKET_CATEGORIES.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      <select
        value={status}
        onChange={(event) => onStatusChange(event.target.value as BucketStatus | "전체")}
        className={CONTROL_STYLE}
      >
        <option value="전체">전체 상태</option>
        {BUCKET_STATUSES.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      <select
        value={sort}
        onChange={(event) => onSortChange(event.target.value as "createdAt" | "targetDate" | "importance")}
        className={CONTROL_STYLE}
      >
        <option value="createdAt">등록순</option>
        <option value="targetDate">목표일순</option>
        <option value="importance">중요도순</option>
      </select>

      <button
        type="button"
        onClick={onToggleFavoriteOnly}
        aria-pressed={favoriteOnly}
        className={`inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-medium ${
          favoriteOnly ? "border-accent bg-accent-soft text-accent" : "border-line bg-surface text-ink-soft"
        }`}
      >
        <Heart className="h-4 w-4" fill={favoriteOnly ? "currentColor" : "none"} />
        즐겨찾기만
      </button>

      <button
        type="button"
        onClick={() => onStatusChange(showingCompletedOnly ? "전체" : "완료")}
        aria-pressed={showingCompletedOnly}
        className={`rounded-lg border px-3 py-2 text-sm font-medium ${
          showingCompletedOnly ? "border-accent bg-accent-soft text-accent" : "border-line bg-surface text-ink-soft"
        }`}
      >
        이룬 것들
      </button>
    </section>
  );
}

export default FilterBar;
```

**Someday/src/components/SummaryBar.tsx**

```typescript
import type { Bucket } from "../types/bucket";

interface SummaryBarProps {
  buckets: Bucket[];
}

/**
 * 전체 달성률 · 올해 목표 현황을 보여주는 요약 영역.
 * 버킷 카드 · 등록 폼이 화면의 주요 콘텐츠이므로, 이 영역은 흰 카드가 아닌
 * 얇은 보조 영역으로 표현한다.
 */
function SummaryBar({ buckets }: SummaryBarProps) {
  const total = buckets.length;
  const completedCount = buckets.filter((bucket) => bucket.status === "완료").length;
  const achievementRate = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  const currentYear = new Date().getFullYear();
  const yearGoals = buckets.filter(
    (bucket) => bucket.targetDate && Number(bucket.targetDate.slice(0, 4)) === currentYear,
  );
  const yearCompleted = yearGoals.filter((bucket) => bucket.status === "완료").length;

  return (
    <section className="flex flex-col gap-4 border-y border-line/70 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-ink-soft">전체 달성률</span>
          <span className="text-ink-faint">{achievementRate}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-soft">
          <div className="h-full rounded-full bg-accent" style={{ width: `${achievementRate}%` }} />
        </div>
      </div>

      <div className="flex items-center gap-6 text-sm text-ink-soft sm:pl-6">
        <div className="flex flex-col items-center">
          <span className="text-lg font-semibold text-ink">{yearGoals.length}</span>
          <span>올해 목표</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-lg font-semibold text-ink">{yearCompleted}</span>
          <span>올해 완료</span>
        </div>
      </div>
    </section>
  );
}

export default SummaryBar;
```

**Someday/.claude/launch.json**

```json
{
  "version": "0.0.1",
  "configurations": [
    {
      "name": "someday-dev",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "port": 5173,
      "autoPort": true
    }
  ]
}
```

**Someday/.claude/settings.local.json**

```json
{
  "permissions": {
    "allow": [
      "Bash(npm -v)",
      "Bash(npm create *)",
      "Bash(npx create-vite@latest --help)",
      "Bash(npx create-vite@latest __vite_tmp__ --template react-ts --no-interactive --no-eslint)",
      "Bash(mv __vite_tmp__/.oxlintrc.json ./)",
      "Bash(rmdir __vite_tmp__)",
      "Bash(npm install *)",
      "Bash(rm -f src/assets/hero.png src/assets/react.svg src/assets/vite.svg src/App.css public/icons.svg public/favicon.svg)",
      "Bash(rmdir src/assets)",
      "Bash(npm run *)",
      "Bash(netstat -ano)",
      "Bash(curl -s -o /dev/null -w \"HTTP %{http_code}\\\\n\" http://127.0.0.1:5173/)",
      "Bash(curl -s http://127.0.0.1:5173/)"
    ]
  }
}
```

## 코드 파일

- [.oxlintrc.json](./code/1786689818749-593117597.json)
- [index.html](./code/1786689818750-772857067.html)
- [package-lock.json](./code/1786689818751-387179398.json)
- [package.json](./code/1786689818752-562413592.json)
- [tsconfig.app.json](./code/1786689818753-527345708.json)
- [tsconfig.json](./code/1786689818754-274329222.json)
- [tsconfig.node.json](./code/1786689818754-35289619.json)
- [vite.config.ts](./code/1786689818755-555333585.ts)
- [App.tsx](./code/1786689818756-121772479.tsx)
- [index.css](./code/1786689818757-132511698.css)
- [main.tsx](./code/1786689818758-887853010.tsx)
- [date.ts](./code/1786689818759-557694351.ts)
- [filterSort.ts](./code/1786689818759-284949678.ts)
- [image.ts](./code/1786689818760-423958500.ts)
- [bucket.ts](./code/1786689818761-711898514.ts)
- [bucketStorage.ts](./code/1786689818762-298187684.ts)
- [BucketCard.tsx](./code/1786689818762-780945091.tsx)
- [BucketForm.tsx](./code/1786689818763-425769318.tsx)
- [FilterBar.tsx](./code/1786689818764-208457782.tsx)
- [SummaryBar.tsx](./code/1786689818765-392656832.tsx)
- [launch.json](./code/1786689818766-819986403.json)
- [settings.local.json](./code/1786689818766-115019519.json)

## 실행 결과

```
Vite 개발 서버 실행 시(npm run dev) 브라우저 화면에 Someday 앱 상단 요약 바, 버킷 등록/필터링 도구, 그리고 초기 예시 데모 버킷 카드 목록(홋카이도 눈축제, 마라톤 완주 등)이 정상적으로 표시됩니다.
```

## 첨부파일

- [.gitignore](./attachments/1786689818746-705033535)
- [AGENTS.md](./attachments/1786689818747-138869709.md)
- [PROJECT_PLAN.md](./attachments/1786689818748-223473392.md)
- [README.md](./attachments/1786689818749-667468749.md)

## 배운 점

React와 TypeScript를 활용해 백엔드 연결 없이 브라우저의 localStorage 기반 CRUD 및 상태 관리를 효율적으로 구성하는 방법을 습득했습니다. 또한 컴포넌트 구조 분리와 함께 다양한 검색/필터/정렬 조건의 중첩 적용 및 날짜 기반 계산(D-Day) 로직을 완성하는 경험을 쌓았습니다.

## 어려웠던 점

검색어, 카테고리, 수행 상태 등의 복합 필터와 목표일/중요도 순 정렬 조건을 최적화하여 동적으로 데이터를 필터링하는 구현 과정이 다소 까다로웠습니다.

---
_Study Archive에서 자동 생성됨 · 마지막 수정: 2026-08-14T06:43:38.767Z_