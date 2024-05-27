/** @type {import('tailwindcss').Config} */
export default {
  content: ['./client/index.html', './client/**/*.{jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: '#ff80ff'
      }
    }
  },
  plugins: []
};
