import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 백엔드(Express, 4000번 포트)로 API/파일 요청을 프록시한다.
// "/assignments"는 프론트엔드 자체 라우트(목록/상세/등록 화면)이므로 프록시하지 않는다.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:4000',
      '/files': 'http://localhost:4000',
    },
  },
});
