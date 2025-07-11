/** @type {import('tailwindcss').Config} */
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#39e079',
        // 필요 시 secondary, accent 등도 등록 가능
      },
    },
  },
  plugins: [],
}


