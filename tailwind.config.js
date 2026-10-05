/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui'] },
      colors: {
        brand: { 50:'#eef7ff',100:'#d8edff',200:'#b8ddff',300:'#87c8ff',400:'#4eabff',500:'#268cff',600:'#0f6fe8',700:'#0b58bc',800:'#0f4b93',900:'#123f73' }
      },
      boxShadow: { soft: '0 12px 40px rgba(15, 23, 42, 0.08)' }
    }
  },
  plugins: []
};
