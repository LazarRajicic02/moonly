import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Deep plum backgrounds
        ink: {
          DEFAULT: '#241026',
          soft: '#311834',
          muted: '#422041',
        },
        // Soft rose-tinted neutrals for text
        lunar: {
          DEFAULT: '#EDCBDA',
          bright: '#FCF0F5',
          dim: '#C495AC',
        },
        // Rose accent
        tide: {
          DEFAULT: '#E86A93',
          soft: '#F49BB8',
        },
        // Lavender secondary accent (fertile window etc.)
        iris: {
          DEFAULT: '#A78BDA',
          soft: '#C7B3EC',
        },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: 'hsl(var(--card))',
        'card-foreground': 'hsl(var(--card-foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        border: 'hsl(var(--border))',
        ring: 'hsl(var(--ring))',
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'Georgia', 'serif'],
        sans: ['var(--font-sora)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'luna-hero':
          'radial-gradient(ellipse 90% 55% at 75% 12%, rgba(232,106,147,0.22), transparent 55%), radial-gradient(ellipse 65% 45% at 15% 85%, rgba(167,139,218,0.16), transparent 55%), linear-gradient(168deg, #241026 0%, #311834 45%, #1D0C1F 100%)',
        'rose-glow':
          'radial-gradient(circle at 50% 0%, rgba(232,106,147,0.25), transparent 65%)',
      },
      boxShadow: {
        glow: '0 0 40px rgba(232,106,147,0.25)',
        card: '0 8px 32px rgba(20,8,22,0.45)',
      },
    },
  },
  plugins: [],
};
export default config;
