/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Red link/accent color, same as the original template's maroon palette.
        brand: {
          DEFAULT: '#A02040',
          50: '#fff1f2',
          100: '#ffe1e3',
          200: '#ffc7cc',
          300: '#ffa0a8',
          400: '#ff6b7a',
          500: '#ff3d51',
          600: '#e11d2e',
          700: '#c1121f',
          800: '#A02040',
          900: '#5c0017',
        },
      },
    },
  },
  plugins: [],
}
