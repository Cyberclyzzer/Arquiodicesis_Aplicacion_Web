/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './public/**/*.{html,js}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          azure: '#F0FFFF',
          beige: '#F5F5DC',
          beigeNaranjoso: '#F1D4A7E5'
        }
      }
    },
  },
  plugins: [],
}
