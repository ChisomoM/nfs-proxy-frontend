/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {

      // ─────────────────────────────────────────────────────────────────────
      // GEEPAY BRAND COLOURS
      // Two base values expanded into full shade scales.
      // gp-cobalt (primary) — structural identity, sidebar accent, badges
      // gp-sky (secondary)  — interactive states, live indicators, data viz
      // gp-navy             — sidebar base, dark surfaces, overlays
      // ─────────────────────────────────────────────────────────────────────
      colors: {

        gp: {

          // Cobalt — primary brand, structure, identity
          cobalt: {
            50: '#ECECF8',
            100: '#D1D2EF',
            200: '#A4A5DF',
            300: '#7679CF',
            DEFAULT: '#383d92',   // base — #383d92
            500: '#2f3480',
            600: '#26296D',
            700: '#1D1F58',
            800: '#141644',
            900: '#0C0D30',
            950: '#06071C',
          },

          // Sky — interactive, CTAs (paired), live states, chart accent
          sky: {
            50: '#E6F7FD',
            100: '#C2EAFB',
            200: '#85D5F7',
            300: '#47C0F3',
            DEFAULT: '#00afeb',   // base — #00afeb
            500: '#009DD4',
            600: '#0089B8',
            700: '#00749A',
            800: '#005F7D',
            900: '#004A61',
            950: '#003347',
          },

          // Navy — sidebar base, dark ambient surfaces, deep overlays
          navy: {
            50: '#EAECF4',
            100: '#C8CCE5',
            200: '#9499CB',
            300: '#6068B0',
            400: '#3D4596',
            500: '#252C7C',
            600: '#1C2266',
            700: '#131850',
            800: '#0C1040',
            DEFAULT: '#080C30',   // base — deep navy sidebar anchor
            950: '#040620',
          },

          // Slate — neutral content surface, table backgrounds, muted UI
          slate: {
            50: '#F7F8FA',
            100: '#EEF0F5',
            200: '#DDE0EB',
            300: '#C4C9D9',
            400: '#9AA0B8',
            500: '#70788F',
            600: '#555D78',
            700: '#3D4560',
            800: '#272F4A',
            900: '#141A34',
          },
        },

        // ─── Semantic ─────────────────────────────────────────────────────
        success: {
          DEFAULT: '#10B981',
          light: '#D1FAE5',
          fg: '#065F46',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7',
          fg: '#78350F',
        },
        danger: {
          DEFAULT: '#EF4444',
          light: '#FEE2E2',
          fg: '#991B1B',
        },
        info: {
          DEFAULT: '#00afeb',
          light: '#E6F7FD',
          fg: '#005F7D',
        },
      },

      // ─────────────────────────────────────────────────────────────────────
      // TYPOGRAPHY
      // Inter           — body, UI labels, table content, form inputs
      // DM Sans         — headings, display, stat numbers, modal titles
      // JetBrains Mono  — transaction IDs, timestamps, hashes, amounts
      // ─────────────────────────────────────────────────────────────────────
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },

      fontSize: {
        'display-2xl': ['4.5rem', { lineHeight: '5.5rem', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-xl': ['3.75rem', { lineHeight: '4.5rem', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-lg': ['3rem', { lineHeight: '3.625rem', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-md': ['2.25rem', { lineHeight: '2.75rem', letterSpacing: '-0.02em', fontWeight: '600' }],
        'display-sm': ['1.875rem', { lineHeight: '2.375rem', letterSpacing: '-0.01em', fontWeight: '600' }],
        'display-xs': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.01em', fontWeight: '600' }],
        'text-xl': ['1.25rem', { lineHeight: '1.875rem', fontWeight: '400' }],
        'text-lg': ['1.125rem', { lineHeight: '1.75rem', fontWeight: '400' }],
        'text-md': ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }],
        'text-sm': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }],
        'text-xs': ['0.75rem', { lineHeight: '1.125rem', fontWeight: '400' }],
      },

      // ─────────────────────────────────────────────────────────────────────
      // SPACING — 4px base grid
      // ─────────────────────────────────────────────────────────────────────
      spacing: {
        '4.5': '1.125rem',  // 18px
        '13': '3.25rem',   // 52px — sidebar collapsed icon row
        '15': '3.75rem',   // 60px — topbar height
        '18': '4.5rem',    // 72px — section gap
        '22': '5.5rem',    // 88px — sidebar collapsed width
        '72': '18rem',     // 288px — sidebar expanded width
      },

      // ─────────────────────────────────────────────────────────────────────
      // BORDER RADIUS
      // ─────────────────────────────────────────────────────────────────────
      borderRadius: {
        'none': '0px',
        'xxs': '2px',
        'xs': '4px',
        'sm': '6px',
        'md': '8px',
        'lg': '10px',
        'xl': '12px',
        '2xl': '16px',
        '3xl': '20px',
        '4xl': '24px',
        'full': '9999px',
      },

      // ─────────────────────────────────────────────────────────────────────
      // SHADOWS
      // ─────────────────────────────────────────────────────────────────────
      boxShadow: {
        'xs': '0 1px 2px rgba(8, 12, 48, 0.05)',
        'sm': '0 1px 3px rgba(8, 12, 48, 0.08), 0 1px 2px rgba(8, 12, 48, 0.05)',
        'md': '0 4px 8px -2px rgba(8, 12, 48, 0.10), 0 2px 4px -2px rgba(8, 12, 48, 0.06)',
        'lg': '0 12px 16px -4px rgba(8, 12, 48, 0.09), 0 4px 6px -2px rgba(8, 12, 48, 0.04)',
        'xl': '0 20px 24px -4px rgba(8, 12, 48, 0.09), 0 8px 8px -4px rgba(8, 12, 48, 0.04)',
        '2xl': '0 24px 48px -12px rgba(8, 12, 48, 0.18)',
        // Focus rings
        'focus-cobalt': '0 0 0 3px rgba(56, 61, 146, 0.22)',
        'focus-sky': '0 0 0 3px rgba(0, 175, 235, 0.22)',
        'focus-error': '0 0 0 3px rgba(239, 68, 68, 0.22)',
        // Brand glow — use sparingly on featured/active elements only
        'glow-cobalt': '0 4px 24px rgba(56, 61, 146, 0.28)',
        'glow-sky': '0 4px 24px rgba(0, 175, 235, 0.24)',
        // Gradient button shadow — pairs with the CTA gradient
        'btn-gradient': '0 4px 16px rgba(0, 175, 235, 0.30), 0 1px 3px rgba(56, 61, 146, 0.20)',
        // Dark surface cards
        'dark-sm': '0 1px 3px rgba(0, 0, 0, 0.35)',
        'dark-md': '0 4px 12px rgba(0, 0, 0, 0.40)',
        'dark-lg': '0 12px 28px rgba(0, 0, 0, 0.50)',
      },

      // ─────────────────────────────────────────────────────────────────────
      // KEYFRAMES & ANIMATIONS
      // ─────────────────────────────────────────────────────────────────────
      keyframes: {
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'fade-in-up': { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'fade-in-down': { '0%': { opacity: '0', transform: 'translateY(-8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'slide-in-left': { '0%': { opacity: '0', transform: 'translateX(-12px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        'slide-in-right': { '0%': { opacity: '0', transform: 'translateX(12px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        'scale-in': { '0%': { opacity: '0', transform: 'scale(0.96)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        'skeleton': { '0%': { backgroundPosition: '200% 0' }, '100%': { backgroundPosition: '-200% 0' } },
        'pulse-ring': {
          '0%': { boxShadow: '0 0 0 0 rgba(0, 175, 235, 0.4)' },
          '70%': { boxShadow: '0 0 0 8px rgba(0, 175, 235, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(0, 175, 235, 0)' },
        },
        'shimmer-gradient': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },

      animation: {
        'fade-in': 'fade-in 200ms ease-out',
        'fade-in-up': 'fade-in-up 300ms cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in-down': 'fade-in-down 300ms cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-left': 'slide-in-left 300ms cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-right': 'slide-in-right 300ms cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scale-in 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        'skeleton': 'skeleton 1.8s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite',
        'shimmer-gradient': 'shimmer-gradient 3s ease-in-out infinite',
      },

      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },

    },
  },
  plugins: [],
}

