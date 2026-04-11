import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand
        indigo: {
          primary: '#4F46E5',
          600: '#4338CA',
          700: '#3730A3',
        },
        teal: {
          accent: '#0D9488',
        },
        amber: {
          xp: '#F59E0B',
          gold: '#D97706',
        },
        // App surfaces
        surface: '#FFFFFF',
        background: '#F8FAFC',
        'dark-card': '#1E1B4B',
        // Grade Band Worlds
        world: {
          'word-garden': '#10B981',
          'sentence-city': '#3B82F6',
          'expression-academy': '#8B5CF6',
          'fluency-arena': '#EF4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      animation: {
        'xp-fill': 'xpFill 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'badge-pop': 'badgePop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'flame-pulse': 'flamePulse 1.5s ease-in-out infinite',
        'float-up': 'floatUp 1.2s ease-out forwards',
        'fade-in': 'fadeIn 0.2s ease-out forwards',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
      },
      keyframes: {
        xpFill: {
          '0%': { width: '0%' },
          '100%': { width: 'var(--xp-width)' },
        },
        badgePop: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '70%': { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        flamePulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.15)', opacity: '0.85' },
        },
        floatUp: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-60px)', opacity: '0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 8px 24px rgba(79,70,229,0.12)',
        xp: '0 0 20px rgba(245,158,11,0.4)',
        badge: '0 4px 16px rgba(79,70,229,0.25)',
      },
    },
  },
  plugins: [],
};

export default config;
