/** @type {import('tailwindcss').Config} */
const c = (name) => `rgb(var(--${name}) / <alpha-value>)`;

module.exports = {
  content: ['./src/**/*.{html,js,jsx,ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    screens: { sm: '640px', md: '768px', lg: '1200px' },
    extend: {
      colors: {
        surface: { page: c('surface-page'), card: c('surface-card'), sunken: c('surface-sunken') },
        line: { DEFAULT: c('border'), strong: c('border-strong') },
        ink: { DEFAULT: c('ink'), muted: c('ink-muted'), inverse: c('ink-inverse') },
        primary: { DEFAULT: c('primary'), hover: c('primary-hover'), soft: c('primary-soft') },
        accent: { DEFAULT: c('accent'), soft: c('accent-soft'), 'on-soft': c('on-accent-soft') },
        trust: { DEFAULT: c('trust'), hover: c('trust-hover'), soft: c('trust-soft'), 'on-soft': c('on-trust-soft') },
        danger: { DEFAULT: c('danger'), soft: c('danger-soft'), 'on-soft': c('on-danger-soft') },
        warning: { soft: c('warning-soft'), 'on-soft': c('on-warning-soft') },
        neutral: { badge: c('neutral-badge'), 'on-badge': c('on-neutral-badge') },
        star: c('rating-star'),
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', '"Noto Sans Devanagari"', 'system-ui', 'sans-serif'],
        sans: ['Inter', '"Noto Sans Devanagari"', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        // [size, { lineHeight, letterSpacing, fontWeight }]
        'title-page':    ['1.75rem',  { lineHeight: '2.125rem', letterSpacing: '-0.02em',  fontWeight: '800' }], // 28/34
        'title-page-lg': ['2rem',     { lineHeight: '2.5rem',   letterSpacing: '-0.02em',  fontWeight: '800' }], // 32/40
        'title-section': ['1.25rem',  { lineHeight: '1.75rem',  letterSpacing: '-0.01em',  fontWeight: '700' }], // 20/28
        'title-section-lg': ['1.5rem', { lineHeight: '2rem',    letterSpacing: '-0.01em',  fontWeight: '700' }], // 24/32
        'title-card':    ['1.125rem', { lineHeight: '1.5rem',   letterSpacing: '-0.005em', fontWeight: '700' }], // 18/24
        body:            ['1rem',     { lineHeight: '1.5rem',   fontWeight: '400' }],                            // 16/24
        meta:            ['0.875rem', { lineHeight: '1.25rem',  fontWeight: '500' }],                            // 14/20
        badge:           ['0.75rem',  { lineHeight: '1rem',     letterSpacing: '0.02em',   fontWeight: '600' }], // 12/16
      },
      spacing: {
        // Tailwind's default scale is already 4px-based (1 = 4px). These add semantic aliases.
        'tap': '48px',          // min touch target
        'search': '52px',       // master search height
        'card': '16px',         // card padding
        'feed': '12px',         // feed gap, mobile
        'feed-lg': '24px',      // feed gap, ≥ md
      },
      minHeight: { tap: '48px' },
      minWidth: { tap: '48px' },
      maxWidth: { content: '1200px', search: '640px' },
      borderRadius: { badge: '6px', control: '10px', card: '16px' },
      boxShadow: {
        card: '0 1px 2px rgb(15 23 42 / 0.06), 0 1px 3px rgb(15 23 42 / 0.10)',
        raised: '0 4px 12px rgb(15 23 42 / 0.12), 0 1px 3px rgb(15 23 42 / 0.08)',
      },
      ringColor: { DEFAULT: c('accent') },
    },
  },
  plugins: [],
};
