/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        frame: '#16282e',
        'frame-soft': '#20383f',
        ground: '#e7ecef',
        ink: '#16282e',
        'ink-soft': '#5d6f76',
        accent: '#4f46e5',
        line: '#d4dbdf',
        st: {
          normal: '#16a34a',
          warning: '#d97706',
          alert: '#dc2626',
          offline: '#94a3b8',
        },
      },
      fontFamily: {
        display: ['Space Grotesk', 'Noto Sans JP', 'sans-serif'],
        readout: ['Space Grotesk', 'Noto Sans JP', 'sans-serif'],
        sans: ['Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Meiryo', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
