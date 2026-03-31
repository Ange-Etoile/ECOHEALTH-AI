/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00796B', 
          dark: '#00C9A7',    
        },
        secondary: {
          DEFAULT: '#00ACC1',
          dark: '#00B4D8',
        },
        'eco-surface': {
          DEFAULT: '#FFFFFF',
          dark: '#0C1A19',
        },
        'eco-bg': {
          DEFAULT: '#F4F7F6',
          dark: '#060F0E',
        }
      }
    },
  },
  corePlugins: {
    preflight: false,
  }
}