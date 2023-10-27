/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,jsx,ts,tsx}'],
  important: true,
  theme: {
    extend: {
      fontSize: {
        xxs: '0.625rem',
      },
      keyframes: {
        wiggle: {
          '0%': { transform: 'rotate(0.0deg)' },
          '50%': { transform: 'rotate(15deg)' },
          '100%': { transform: 'rotate(0.0deg)' },
        },
        'ping-sm': {
          '0%': { transform: 'scale(1)', opacity: 0.75 },
          '50%': { transform: 'scaleY(1.5) scaleX(1.1)', opacity: 0 },
          '100%': { transform: 'scaleY(1.5) scaleX(1.1)', opacity: 0 },
        },
        'popup': {
          '0%': { transform: 'scale(0.2)' },
          '80%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' },
        }
      },
      animation: {
        wiggle: 'wiggle 0.6s ease 1',
        'ping-sm': 'ping-sm 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'popup': 'popup 0.2s ease-in-out',
      },
    },
  },
  plugins: [],
}
