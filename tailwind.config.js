/** @type {import('tailwindcss').Config} */
module.exports = {
  // Only scan component/page files — we do NOT use Tailwind classes in the design.
  // Tailwind is installed as a dependency but the entire visual design lives in globals.css.
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};