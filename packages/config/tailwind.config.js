/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    '../../packages/ui/**/*.{js,ts,jsx,tsx}',
    '!../../packages/ui/**/node_modules/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

