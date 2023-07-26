/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Montserrat', 'Helvetica', 'Arial', 'sans-serif'],
      },
      gridTemplateRows: {
        // Complex site-specific row configuration
        'hero': '0.1fr minmax(0,5fr)',
      }
    },
  },
  plugins: [
    require('tailwind-scrollbar')
  ],
}

