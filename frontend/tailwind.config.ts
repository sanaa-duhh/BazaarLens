import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0A0A0A',
        card: '#111111',
        primary: {
          DEFAULT: '#2563EB',
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#F59E0B',
          foreground: '#0A0A0A',
        },
        foreground: '#FFFFFF',
        muted: {
          DEFAULT: '#27272A',
          foreground: '#A1A1AA',
        },
        border: '#27272A',
        destructive: {
          DEFAULT: '#EF4444',
          foreground: '#FFFFFF',
        },
        success: '#22C55E',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out forwards',
        'slide-up': 'slideUp 0.3s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
