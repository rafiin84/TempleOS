/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7C6CF2',
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#7C6CF2',
          600: '#6D56E8',
          700: '#5B3FD4',
          800: '#4C32B8',
          900: '#3E2895',
        },
        surface: '#FFFFFF',
        background: '#FAFAFC',
        'light-violet': '#F5F3FF',
        brand: {
          text: '#111827',
          muted: '#6B7280',
          border: '#ECECEC',
        },
        success: { DEFAULT: '#16A34A', light: '#DCFCE7' },
        warning: { DEFAULT: '#F59E0B', light: '#FEF3C7' },
        danger: { DEFAULT: '#DC2626', light: '#FEE2E2' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        sm: '8px',
        DEFAULT: '12px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },
      boxShadow: {
        soft: '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        card: '0 4px 16px 0 rgb(0 0 0 / 0.06), 0 1px 3px 0 rgb(0 0 0 / 0.04)',
        elevated: '0 8px 32px 0 rgb(0 0 0 / 0.08), 0 2px 8px 0 rgb(0 0 0 / 0.04)',
      },
      maxWidth: { feed: '550px' },
      spacing: { '18': '4.5rem', '22': '5.5rem' },
    },
  },
  plugins: [],
}


