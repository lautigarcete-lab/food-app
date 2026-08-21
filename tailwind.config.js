/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FDFBF7',
        mint: '#10B981',
        cheddar: '#FBBF24',
        coral: '#F87171',
      },
      borderRadius: {
        '3xl': '1.5rem',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        bouncy: ['Fredoka', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
