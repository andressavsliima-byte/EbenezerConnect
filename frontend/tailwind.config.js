module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'],
      },
      colors: {
        ebenezer: {
          green: '#07ab25db',
          black: '#1f1f1fff',
          white: '#FFFFFF',
          light: '#F5F5F5',
          dark: '#2D2D2D',
          'light-green': '#94ff9fff',
          'green-dark': '#003807ff',
        }
      }
    },
  },
  plugins: [],
}
