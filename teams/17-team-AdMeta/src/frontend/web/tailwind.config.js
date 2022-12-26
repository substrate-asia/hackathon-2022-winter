/** @type {import('tailwindcss').Config} */
module.exports = {
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontSize: {
        'banner-t': '2.5rem'
      },
      spacing: {
        'header-h': '5.5rem',
        'banner-h': '26.25rem',
        'task-w': '43.75rem',
        'task-p': '3.75rem'
      },
      colors: {
        gray: {
          1000: 'rgba(255, 255, 255, 0.8)',
          1010: '#525461',
          1020: '#777E90'
        },
        black: {
          1000: '#141416',
          1010: '#18191D',
          1020: '#2A2D36'
        },
        blue: {
          1000: '#3772FF'
        }
      },
      backgroundImage: {
        banner: 'public/banner-bg.png'
      }
    },
  },
  plugins: [],
}
