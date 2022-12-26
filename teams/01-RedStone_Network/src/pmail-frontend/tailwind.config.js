/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
    'node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    colors: {
      background: 'var(--main-bg-color)',
      SideBarBackground: 'var(--side-bg-color)',
      SideBarText: 'var(--main-text-color)',
      mainText: 'var(--main-text-color)',
      blackText: 'var(--black-text-color)',
      whiteText: 'var(--white-text-color)',
      grayText: '#B3B3B3',
      grayBtnBackground: 'var(--gray-gray-btn)',
      SideBarActiveBackground: 'var(--active-side-bg-color)',
      sideBarHoverBackground: 'var(--hover-side-bg-color)',
      white: 'var(--white)',
      borderGray: 'var(--gray)',
      textBlue: '#2D69D2',
      bgBlue: '#E3E3FF',
      btnBlue: '#2526D9',
      btnHoverBlue: '#1D1D9E',
      textBlack: '#1A1A1A',
      btnGary: '#E5E5E5',
      btnHoverGary: '#CCCCCC',
      iconHoverGary: '#E6E6E6',
      bgGray: '#F0F0F0',
      primary: '#D62EFF'
    },
    container: {
      center: true
    },
    fontSize: {
      xs: ['12px', '14px'],
      sm: ['14px', '15px'],
      base: ['16px', '24px'],
      lg: ['20px', '28px'],
      xl: ['24px', '32px'],
      50: ['50px', '50px']
    },
    extend: {
      spacing: {
        14: '14px',
        30: '30px',
        256: '256px',
        117: '117px',
        236: '236px',
        50: '50px',
        951: '951px',
        363: '363px',
        196: '196px',
        188: '188px',
        178: '19.3vh'
      },
      backgroundImage: {
        'login-bg': "url('/src/assets/bg.png')"
      }
    }
  },
  plugins: [require('tailwind-scrollbar'), require('flowbite/plugin')]
}
