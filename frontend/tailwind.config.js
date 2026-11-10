/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}', './features/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        cream: '#FFF9F0',
        paper: '#FFFFFF',
        ink: '#17212B',
        muted: '#6B7480',
        line: '#E8E3DB',
        yellow: '#F8AD05',
        amber: '#F8AD05',
        amberSoft: '#FFF1C7',
        navySoft: '#EAF1F7',
        green: '#2D9D66',
        greenSoft: '#E7F6EC',
        red: '#D94B4B',
        redSoft: '#FDEAEA',
      },
    },
  },
  plugins: [],
};
