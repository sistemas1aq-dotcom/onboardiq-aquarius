/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        navy: '#0a1f3d',
        blue1: '#0d4f8b',
        blue2: '#1a7ec5',
        cyan: '#3ec6e0',
        light: '#e8f4f8',
      },
      fontFamily: {
        sans: ['DM Sans', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
