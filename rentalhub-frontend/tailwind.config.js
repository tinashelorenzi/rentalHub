/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2A9DF4',
          light: '#5CB8F9',
          dark: '#1A8DE4',
        },
        secondary: {
          DEFAULT: '#27AE60',
          light: '#4CD680',
          dark: '#1E8449',
        },
        accent: {
          DEFAULT: '#E67E22',
          light: '#F39C12',
          dark: '#D35400',
        },
        neutral: {
          DEFAULT: '#F5F5F5',
          dark: '#2C3E50',
        },
      },
    },
  },
  plugins: [],
}