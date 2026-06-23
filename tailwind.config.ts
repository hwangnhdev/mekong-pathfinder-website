import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font)', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: '#4361ee',
        'primary-dark': '#2f4fd4',
      },
    },
  },
  plugins: [],
};

export default config;