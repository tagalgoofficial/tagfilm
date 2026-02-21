/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'accent-gold': '#FFD700',
        'accent-neon': '#00FF9F',
      },
      fontFamily: {
        'arabic': ['Tajawal', 'sans-serif'],
        'english': ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
        'card-hover': 'linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(0,255,159,0.1) 100%)',
      },
    },
  },
  plugins: [],
}
