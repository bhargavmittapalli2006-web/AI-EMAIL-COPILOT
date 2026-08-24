/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Theme variables mapping
        app: 'var(--bg-app)',
        sidebar: 'var(--bg-sidebar)',
        panel: 'var(--bg-panel)',
        card: 'var(--bg-card)',
        elevated: 'var(--bg-elevated)',
        'theme-border': 'var(--border)',
        'theme-border-subtle': 'var(--border-subtle)',
        'theme-text-primary': 'var(--text-primary)',
        'theme-text-secondary': 'var(--text-secondary)',
        'theme-text-muted': 'var(--text-muted)',
        'theme-text-disabled': 'var(--text-disabled)',
        'theme-accent': 'var(--accent)',
        'theme-accent-hover': 'var(--accent-hover)',

        // Enterprise dark shades for reliable fallback
        slate: {
          850: '#151E2E',
          925: '#0D1424',
          950: '#0B1020',
        },

        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        surface: {
          light: '#f8fafc',
          cardLight: '#ffffff',
          dark: '#0B1020',
          cardDark: '#151E2E',
          darker: '#080B14',
          borderLight: '#e2e8f0',
          borderDark: '#263247',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'dropdown': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      }
    },
  },
  plugins: [],
}
