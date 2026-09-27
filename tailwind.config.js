/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#050506',
          900: '#0a0a0d',
          850: '#0f0f13',
          800: '#14141a',
          750: '#1a1a21',
          700: '#21212a',
          600: '#2c2c37',
        },
        brand: {
          50: '#fff1f2',
          100: '#ffe0e2',
          200: '#ffc5c8',
          300: '#ff9ea4',
          400: '#ff6b74',
          500: '#f43f4f',
          550: '#e11d48',
          600: '#c70f3c',
          700: '#a50c33',
          800: '#880f2c',
          900: '#71112b',
        },
        gold: {
          300: '#ffd98a',
          400: '#f5b544',
          500: '#e09a1f',
        },
      },
      fontFamily: {
        display: ['"Unbounded"', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      // Расширяем шкалу прозрачности: в дизайне используются нестандартные шаги
      opacity: {
        4: '0.04',
        6: '0.06',
        8: '0.08',
        12: '0.12',
        15: '0.15',
        18: '0.18',
        35: '0.35',
        45: '0.45',
        55: '0.55',
        65: '0.65',
        85: '0.85',
        98: '0.98',
      },
      backgroundImage: {
        'grid-dark':
          'linear-gradient(to right, rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px)',
        'red-glow': 'radial-gradient(60% 60% at 50% 0%, rgba(244,63,79,0.28) 0%, transparent 70%)',
        'red-line': 'linear-gradient(90deg, transparent, #f43f4f, transparent)',
      },
      backgroundSize: {
        grid: '48px 48px',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.85)', opacity: '0.7' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'spin-slow': {
          to: { transform: 'rotate(360deg)' },
        },
        'scan-line': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.25' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 2.2s infinite',
        marquee: 'marquee 32s linear infinite',
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.2,0.8,0.2,1) infinite',
        'gradient-x': 'gradient-x 8s ease infinite',
        'spin-slow': 'spin-slow 18s linear infinite',
        'scan-line': 'scan-line 7s linear infinite',
        blink: 'blink 1.6s ease-in-out infinite',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(244,63,79,0.35), 0 10px 40px -8px rgba(244,63,79,0.45)',
        'glow-lg': '0 0 0 1px rgba(244,63,79,0.4), 0 24px 80px -20px rgba(244,63,79,0.6)',
        card: '0 1px 0 0 rgba(255,255,255,0.05) inset, 0 20px 40px -24px rgba(0,0,0,0.9)',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
}
