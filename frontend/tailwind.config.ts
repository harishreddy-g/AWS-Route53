import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        aws: {
          orange: '#ff9900',
          orangeDark: '#ec7211',
          slate: '#232f3e',
          slateDark: '#16191f',
          slateLight: '#37475a',
          gray: '#f2f3f3',
          grayPanel: '#fafafa',
          border: '#d5dbdb',
          borderLight: '#eaeded',
          text: '#16191f',
          muted: '#545b64',
          link: '#0073bb',
          linkHover: '#004d7a',
        },
      },
      fontFamily: {
        sans: ['"Source Sans 3"', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      },
      fontSize: {
        'aws-xs': ['12px', { lineHeight: '16px' }],
        'aws-sm': ['14px', { lineHeight: '20px' }],
        'aws-base': ['14px', { lineHeight: '22px' }],
      },
      boxShadow: {
        aws: '0 1px 1px 0 rgba(0, 28, 36, 0.15)',
      },
    },
  },
  plugins: [],
};

export default config;
