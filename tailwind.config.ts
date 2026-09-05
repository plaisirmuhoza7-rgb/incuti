import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        forest: {
          50:  '#edf7ee',
          100: '#c8e8cb',
          200: '#a0d4a6',
          300: '#72bf7a',
          400: '#43a852',
          500: '#228b38',   // true mid forest green
          600: '#1a7030',
          700: '#145726',
          800: '#0f421d',   // main dark forest green
          900: '#092e13',
          950: '#041808',
        },
        earth: {
          50:  '#fefce8',
          100: '#fef4a0',
          200: '#fde047',
          300: '#f5c518',   // bold yellow
          400: '#e6ac00',
          500: '#c98f00',
          600: '#a87200',
          700: '#855800',
          800: '#633f00',
          900: '#3d2700',
          950: '#1f1300',
        }
      },
    },
  },
  plugins: [],
};
export default config;
