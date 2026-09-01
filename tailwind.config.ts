import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Base surfaces
        'surface-0': '#0f1117',
        'surface-1': '#161b27',
        'surface-2': '#1e2535',
        'surface-3': '#262d3d',
        // Brand
        'aria-purple':       '#7c3aed',
        'aria-purple-light': '#a78bfa',
        'aria-purple-dim':   '#4c1d95',
        // Role colours
        'role-teacher': '#3b82f6',
        'role-student': '#10b981',
        'role-aria':    '#7c3aed',
        // Status
        'live-red':       '#ef4444',
        'connected-green': '#22c55e',
        'warning-amber':  '#f59e0b',
      },
      animation: {
        'pulse-ring':   'pulse-ring 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'speaking-bar': 'speaking-bar 0.8s ease-in-out infinite alternate',
        'fade-in':      'fade-in 0.15s ease-out',
        'slide-in-right': 'slide-in-right 0.2s ease-out',
      },
      keyframes: {
        'pulse-ring': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(124, 58, 237, 0.4)' },
          '50%':      { boxShadow: '0 0 0 12px rgba(124, 58, 237, 0)' },
        },
        'speaking-bar': {
          '0%':   { transform: 'scaleY(0.3)' },
          '100%': { transform: 'scaleY(1)' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(12px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
