import type { Config } from 'tailwindcss'

export default {
  content: [
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f4faf0',
          100: '#e5f5d8',
          200: '#cceab5',
          300: '#b8e298',
          400: '#bbdf90',
          500: '#b3dc8c',
          600: '#AADD88',
          700: '#8ecc6e',
          800: '#6aaa4a',
          900: '#4d8a32',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
