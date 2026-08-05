import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'rgb(249 250 251 / <alpha-value>)',
          100: 'rgb(243 244 246 / <alpha-value>)',
          200: 'rgb(229 231 235 / <alpha-value>)',
          300: 'rgb(209 213 219 / <alpha-value>)',
          400: 'rgb(156 163 175 / <alpha-value>)',
          500: 'rgb(107 114 128 / <alpha-value>)',
          600: 'rgb(75 85 99 / <alpha-value>)',
          700: 'rgb(55 65 81 / <alpha-value>)',
          800: 'rgb(31 41 55 / <alpha-value>)',
          900: 'rgb(17 24 39 / <alpha-value>)',
        },
        accent: {
          50: 'rgb(255 251 235 / <alpha-value>)',
          100: 'rgb(254 243 199 / <alpha-value>)',
          200: 'rgb(253 230 138 / <alpha-value>)',
          300: 'rgb(252 211 77 / <alpha-value>)',
          400: 'rgb(251 191 36 / <alpha-value>)',
          500: 'rgb(245 158 11 / <alpha-value>)',
          600: 'rgb(217 119 6 / <alpha-value>)',
          700: 'rgb(180 83 9 / <alpha-value>)',
          800: 'rgb(146 64 14 / <alpha-value>)',
        },
        success: {
          50: 'rgb(236 253 245 / <alpha-value>)',
          100: 'rgb(209 250 229 / <alpha-value>)',
          500: 'rgb(16 185 129 / <alpha-value>)',
          600: 'rgb(5 150 105 / <alpha-value>)',
          700: 'rgb(4 120 87 / <alpha-value>)',
        },
        warning: {
          500: 'rgb(249 115 22 / <alpha-value>)',
          600: 'rgb(234 88 12 / <alpha-value>)',
        },
        error: {
          50: 'rgb(254 242 242 / <alpha-value>)',
          100: 'rgb(254 226 226 / <alpha-value>)',
          500: 'rgb(239 68 68 / <alpha-value>)',
          600: 'rgb(220 38 38 / <alpha-value>)',
        },
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      borderRadius: {
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
      },
      minHeight: {
        touch: '2.75rem', // 44px for touch targets
      },
      minWidth: {
        touch: '2.75rem', // 44px for touch targets
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, rgb(55 65 81) 0%, rgb(17 24 39) 100%)',
        'gradient-accent': 'linear-gradient(135deg, rgb(251 191 36) 0%, rgb(217 119 6) 100%)',
      },
    },
  },
  plugins: [],
  darkMode: 'media',
};

export default config;
