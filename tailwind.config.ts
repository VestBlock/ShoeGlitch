import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        // Deep navy ink — headings and dark sections
        ink: {
          DEFAULT: '#0A0F1F',
          soft: '#111A33',
          muted: '#1E2A4A',
        },
        // Off-white paper tone
        bone: {
          DEFAULT: '#F4F7FB',
          soft: '#E8EEF7',
          dim: '#CFD9E8',
        },
        // Signature electric blue (primary brand — matches logo)
        glitch: {
          DEFAULT: '#1E90FF',
          deep: '#0B5FD0',
          soft: '#5CB0FF',
        },
        // Acid cyan — digital glitch accent
        cyan: {
          DEFAULT: '#00E5FF',
          soft: '#7FEDFF',
          deep: '#00A9C7',
        },
        acid: '#AEFF3C',
        neon: '#00FFB8',
        ruby: '#FF2E6B',
      },
      borderRadius: {
        card: '18px',
      },
      boxShadow: {
        ink: '0 20px 60px -20px rgba(10,15,31,0.5)',
        glitch: '0 20px 60px -20px rgba(30,144,255,0.45)',
        pop: '0 8px 0 0 #0A0F1F',
      },
      animation: {
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards',
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        marquee: 'marquee 40s linear infinite',
      },
      keyframes: {
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
