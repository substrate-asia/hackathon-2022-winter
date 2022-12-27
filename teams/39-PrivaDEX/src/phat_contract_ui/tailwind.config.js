module.exports = {
  theme: {
    extend: {
      fontFamily: {
        serif: [
          'poppins',
          'ui-serif',
          'sans-serif',
        ],
        mono: [
          '"Roboto Mono"',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          '"Liberation Mono"',
          '"Courier New"',
          'monospace',
        ],
        heading: 'Montserrat',
      },
      colors: {
        brand: {
          DEFAULT: '#6FB74E',
          '100': '#E7F3E2',
          '200': '#ADD69A',
          '300': '#6FB74E',
          '400': '#5F9F41',
          '500': '#56913B',
          '600': '#45742F',
          '700': '#345723',
          '800': '#2B481E',
          '900': '#233A18'
        },
        phalaDark: {
          DEFAULT: '#9DC431',
          '50': '#E2EFBE',
          '100': '#DAEBAE',
          '200': '#CCE28D',
          '300': '#BDDA6C',
          '400': '#AED24C',
          '500': '#9DC431',
          '600': '#799726',
          '700': '#556A1B',
          '800': '#313D0F',
          '900': '#0D1004'
        },
        phala: {
          DEFAULT: '#D1FF52',
          '50': '#FFFFFF',
          '100': '#FCFFF5',
          '200': '#F2FFCC',
          '300': '#E7FFA4',
          '400': '#DCFF7B',
          '500': '#D1FF52',
          '600': '#C2FF1A',
          '700': '#A5E100',
          '800': '#7CA900',
          '900': '#537100'
        }
      }
    },
    screens: {
      sm: '640px',
      // => @media (min-width: 640px) { ... }
      md: '768px',
      // => @media (min-width: 768px) { ... }
      lg: '1024px',
      // => @media (min-width: 1024px) { ... }
      xl: '1280px',
      // => @media (min-width: 1280px) { ... }
      '2xl': '1536px',
      // => @media (min-width: 1536px) { ... }
      '3xl': '1600px',
      // => @media (min-width: 1536px) { ... }
      '4xl': '1920px',
    },
  },
}