import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-blue':      '#3b84ff',
        'brand-orange':    '#fb5607',
        'brand-yellow':    '#ffb30c',
        'brand-off-black': '#140f0c',
        'brand-off-white': '#f4f4f4',
      },
      fontFamily: {
        sans: ['Carlito', 'sans-serif'],
      },
      backgroundImage: {
        'brand-gradient':
          'linear-gradient(135deg, #FACC22, #FB5607, #4760FF, #0DCCFF)',
      },
      keyframes: {
        'slide-in-left': {
          '0%':   { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)',      opacity: '1' },
        },
      },
      animation: {
        'slide-in-left':
          'slide-in-left 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
      },
    },
  },
  plugins: [],
}

export default config