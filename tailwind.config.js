/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fudi: {
          bg: '#FDFBF7',
          red: '#9B1B30',
          'red-dark': '#7A1526',
          yellow: '#F59E0B',
          'yellow-light': '#FBBF24',
          text: '#1F2937',
          muted: '#6B7280'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 10px 40px -10px rgba(0,0,0,0.06)',
        'float': '0 20px 40px -15px rgba(155,27,48,0.4)',
      },
      borderRadius: {
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
}
