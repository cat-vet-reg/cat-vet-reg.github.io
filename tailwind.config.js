/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
      },
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'var(--color-border)', /* primary/15 or slate-200/10 */
        input: 'var(--color-input)', /* gray-200 or slate-700 */
        ring: 'var(--color-ring)', /* blue-600 or blue-500 */
        background: 'var(--color-background)', /* gray-50 or slate-900 */
        foreground: 'var(--color-foreground)', /* gray-800 or gray-200 */
        primary: {
          DEFAULT: 'var(--color-primary)', /* blue-600 or blue-500 */
          foreground: 'var(--color-primary-foreground)', /* white */
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)', /* violet-600 or violet-500 */
          foreground: 'var(--color-secondary-foreground)', /* white */
        },
        destructive: {
          DEFAULT: 'var(--color-destructive)', /* red-600 or red-500 */
          foreground: 'var(--color-destructive-foreground)', /* white */
        },
        muted: {
          DEFAULT: 'var(--color-muted)', /* slate-100 or slate-700 */
          foreground: 'var(--color-muted-foreground)', /* gray-500 or slate-400 */
        },
        accent: {
          DEFAULT: 'var(--color-accent)', /* amber-500 or amber-400 */
          foreground: 'var(--color-accent-foreground)', /* gray-800 or slate-900 */
        },
        popover: {
          DEFAULT: 'var(--color-popover)', /* white or slate-800 */
          foreground: 'var(--color-popover-foreground)', /* gray-800 or gray-200 */
        },
        card: {
          DEFAULT: 'var(--color-card)', /* slate-50 or slate-800 */
          foreground: 'var(--color-card-foreground)', /* gray-700 or slate-300 */
        },
        success: {
          DEFAULT: 'var(--color-success)', /* emerald-600 or emerald-500 */
          foreground: 'var(--color-success-foreground)', /* white */
        },
        warning: {
          DEFAULT: 'var(--color-warning)', /* amber-600 or amber-500 */
          foreground: 'var(--color-warning-foreground)', /* white */
        },
        error: {
          DEFAULT: 'var(--color-error)', /* red-600 or red-500 */
          foreground: 'var(--color-error-foreground)', /* white */
        },
      },
      borderRadius: {
        sm: 'var(--radius-sm)', /* 6px */
        DEFAULT: 'var(--radius-md)', /* 12px */
        md: 'var(--radius-md)', /* 12px */
        lg: 'var(--radius-lg)', /* 18px */
        xl: 'var(--radius-xl)', /* 24px */
      },
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        body: ['Source Sans 3', 'sans-serif'],
        caption: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      maxWidth: {
        'prose': '70ch',
      },
      ringWidth: {
        '3': '3px',
      },
      ringOffsetWidth: {
        '3': '3px',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-in-from-top': {
          from: { transform: 'translateY(-10px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in-from-bottom': {
          from: { transform: 'translateY(10px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-in-from-top': 'slide-in-from-top 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-in-from-bottom': 'slide-in-from-bottom 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('tailwindcss-animate'),
  ],
}