import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#09090b',
        foreground: '#fafafa',
        card: '#111113',
        muted: '#71717a',
        border: '#27272a',
        accent: '#fafafa',
        danger: '#ef4444',
        success: '#22c55e',
      },
    },
  },
  plugins: [],
};

export default config;
