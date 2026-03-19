/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fdf8e8',
          100: '#f9edc4',
          200: '#f3d98a',
          300: '#ecc44f',
          400: '#e5af1a',
          500: '#c99a0d',
          600: '#a07808',
          700: '#785a06',
          800: '#51400a',
          900: '#2d2406',
        },
        lounge: {
          50: '#f5f3ef',
          100: '#e8e4db',
          200: '#d1c9b7',
          300: '#b8a98e',
          400: '#9f8a65',
          500: '#867148',
          600: '#6b5a3a',
          700: '#50432c',
          800: '#362d1e',
          900: '#1b1610',
          950: '#0d0b08',
        }
      },
      fontFamily: {
        serif: ['Georgia', 'Playfair Display', 'Times New Roman', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
