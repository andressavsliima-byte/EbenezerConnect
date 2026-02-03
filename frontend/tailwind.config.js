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
          green: '#7fbf20',
          black: '#1f1f1fff',
          white: '#FFFFFF',
          light: '#F5F5F5',
          dark: '#2D2D2D',
          'light-green': '#9ed85a',
          'green-forest': '#55821a',
          // darker variant for gradients and accents
          'green-dark': '#6aa61a',
        }
      }
    },
  },
  plugins: [],
}
