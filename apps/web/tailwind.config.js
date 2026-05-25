/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Sierra Blu Strict Palette — Cinematic Luxury, Institutional Precision
        ivory: {
          50: '#FAF9F7',
          100: '#F4F0E8',
          200: '#E8E1D9',
          DEFAULT: '#F4F0E8',
        },
        navy: {
          50: '#1B3A52',
          100: '#0F2847',
          200: '#0B2341',
          300: '#081D35',
          DEFAULT: '#0B2341',
        },
        'sierra-blue': {
          50: '#E3F2FD',
          100: '#BBDEFB',
          200: '#90CAF9',
          300: '#64B5F6',
          400: '#42A5F5',
          500: '#1E88D9',
          600: '#1976D2',
          700: '#1565C0',
          DEFAULT: '#1E88D9',
        },
        gold: {
          50: '#FFFBF0',
          100: '#FFE8C0',
          200: '#FFD699',
          300: '#F5C04A',
          400: '#D9B04A',
          500: '#C9A24A',
          600: '#B8943D',
          DEFAULT: '#C9A24A',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Courier New', 'monospace'],
      },
      fontSize: {
        'display-lg': ['4rem', { lineHeight: '1.1', fontWeight: '300' }],
        'display-md': ['3rem', { lineHeight: '1.15', fontWeight: '300' }],
        'heading-lg': ['2rem', { lineHeight: '1.2', fontWeight: '600' }],
        'heading-md': ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],
        'body': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
        'label': ['0.75rem', { lineHeight: '1.4', fontWeight: '500', letterSpacing: '0.05em' }],
      },
      spacing: {
        safe: 'max(1rem, env(safe-area-inset-left))',
        'safe-r': 'max(1rem, env(safe-area-inset-right))',
      },
      backgroundImage: {
        'gradient-subtle': 'linear-gradient(135deg, rgba(244, 240, 232, 0.1) 0%, rgba(30, 136, 217, 0.05) 100%)',
        'gradient-hero': 'linear-gradient(130deg, rgba(11, 35, 65, 0.97) 0%, rgba(13, 32, 53, 0.85) 45%, rgba(11, 35, 65, 0.4) 100%)',
      },
      boxShadow: {
        'luxury': '0 20px 60px rgba(0, 0, 0, 0.15)',
        'card': '0 8px 24px rgba(0, 0, 0, 0.08)',
        'sm-luxury': '0 4px 12px rgba(0, 0, 0, 0.06)',
      },
      blur: {
        xs: '2px',
      },
      opacity: {
        3: '0.03',
        8: '0.08',
      },
    },
  },
  plugins: [],
};
