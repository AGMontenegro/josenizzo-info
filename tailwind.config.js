/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'news-primary': '#1a1a1a',
        'news-secondary': '#f5f5f5',
        'news-accent': '#e63946',
      },
      fontFamily: {
        'headline': ['Georgia', 'serif'],
        'body': ['Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
