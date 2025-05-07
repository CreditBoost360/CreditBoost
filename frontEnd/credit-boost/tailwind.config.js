/** @type {import('tailwindcss').Config} */ 
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
      screens: {
        'xs': '360px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: "#02A669",
          light: "#05B19B",
        },
        secondary: {
          DEFAULT: "#0177A5",
          light: "#12AACF",
        },
        background: "#F6F8F6",
        foreground: "#000000",
        border: "#E2E8F0",
        input: "#E2E8F0",
        ring: "#02A669",
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#F1F5F9",
          foreground: "#64748B",
        },
        accent: {
          DEFAULT: "#05B19B",
          foreground: "#FFFFFF",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#000000",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#000000",
        },
      },
      fontFamily: {
        brand: ["'Montserrat'", 'sans-serif'],
      },
      fontSize: {
        'brand-credit': ['2rem', { letterSpacing: '0.01em', fontWeight: '900' }],
        'brand-boost': ['2rem', { letterSpacing: '0.01em', fontWeight: '700', color: '#02A669' }],
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      touchAction: {
        'manipulation': 'manipulation',
      },
      screens: {
        'xs': '360px',
        'touch': { raw: '(pointer: coarse)' },
        'stylus': { raw: '(pointer: fine)' },
        'hover-device': { raw: '(hover: hover)' },
        'portrait': { raw: '(orientation: portrait)' },
        'landscape': { raw: '(orientation: landscape)' },
      },
      keyframes: {
        taphold: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.95)' },
        },
        tapfeedback: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.98)' },
          '100%': { transform: 'scale(1)' },
        }
      },
      animation: {
        taphold: 'taphold 1s ease-in-out',
        tapfeedback: 'tapfeedback 0.2s ease-in-out',
      }
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/forms"),
    // Add a plugin for touch utilities
    function({ addUtilities }) {
      addUtilities({
        '.touch-manipulation': {
          'touch-action': 'manipulation',
        },
        '.touch-callout-none': {
          '-webkit-touch-callout': 'none',
        },
        '.user-select-none': {
          '-webkit-user-select': 'none',
          'user-select': 'none',
        },
        '.tap-highlight-none': {
          '-webkit-tap-highlight-color': 'transparent',
        },
      });
    },
  ],
};