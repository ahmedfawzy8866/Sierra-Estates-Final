/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/ui/**/*.{js,ts,jsx,tsx,mdx}',
    './components/Listings/**/*.{js,ts,jsx,tsx,mdx}',
    './components/UI/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Sierra Blu Official Palette V3.0
        gold: {
          50: '#FFFBF5',
          100: '#F5E070',
          300: '#E9C176',
          400: '#C9A84C',
          500: '#B08E35',
          DEFAULT: '#C9A84C',
        },
        navy: {
          50: '#E0E8F0',
          100: '#0D2035',
          200: '#0A1520',
          300: '#071422',
          DEFAULT: '#071422',
        },
        ivory: {
          DEFAULT: '#F4F0E8',
        },
        pinblue: {
          DEFAULT: '#1E88D9',
        },
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'serif'],
        sans: ['Inter', 'sans-serif'],
        arabic: ['Tajawal', 'sans-serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #C9A84C 0%, #E9C176 50%, #987734 100%)',
      },
    },
  },
  plugins: [],
};
