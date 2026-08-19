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
