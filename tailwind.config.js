/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./main.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./imports/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        'xs': '320px',
        'sm': '375px',
        'md': '640px',
        'lg': '768px',
        'xl': '1024px',
        '2xl': '1280px',
      },
      fontSize: {
        'responsive-xs': 'clamp(10px, 2vw, 12px)',
        'responsive-sm': 'clamp(12px, 2.2vw, 14px)',
        'responsive-base': 'clamp(14px, 2.5vw, 16px)',
        'responsive-lg': 'clamp(16px, 3vw, 18px)',
        'responsive-xl': 'clamp(18px, 3.5vw, 20px)',
        'responsive-2xl': 'clamp(20px, 4vw, 24px)',
        'responsive-3xl': 'clamp(24px, 5vw, 28px)',
        'responsive-4xl': 'clamp(28px, 6vw, 32px)',
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      minHeight: {
        'touch': '44px',
        'touch-small': '32px',
      },
      minWidth: {
        'touch': '44px',
        'touch-small': '32px',
      },
      scale: {
        '98': '0.98',
      },
      transitionDuration: {
        '400': '400ms',
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'fade-out': 'fadeOut 0.2s ease-out',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}