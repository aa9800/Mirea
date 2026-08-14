/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Pretendard', 'Apple SD Gothic Neo', 'Malgun Gothic', 'sans-serif'],
      },
      colors: {
        bg: '#f5f6fa',
        card: '#ffffff',
        ink: '#1f2430',
        muted: '#6b7280',
        line: '#e2e5ec',
        primary: {
          DEFAULT: '#4f6df5',
          dark: '#3d59db',
        },
        danger: '#e5484d',
        success: '#1a9e5c',
        warning: '#c78a1a',
      },
    },
  },
  plugins: [],
};
