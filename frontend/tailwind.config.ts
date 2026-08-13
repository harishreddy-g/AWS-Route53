import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        aws: {
          orange: '#ff9900',
          orangeDark: '#f58220',
          slate: '#232f3e',
          slateLight: '#37475a',
          gray: '#f2f3f3',
          border: '#d5dbdb',
          text: '#16191f',
          muted: '#6b7280'
        }
      },
      boxShadow: {
        soft: '0 1px 2px rgba(15, 23, 42, 0.08)',
        panel: '0 1px 3px rgba(15, 23, 42, 0.08), 0 2px 8px rgba(15, 23, 42, 0.06)'
      }
    },
  },
  plugins: [],
};

export default config;
