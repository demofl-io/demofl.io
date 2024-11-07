module.exports = {
  content: ["./html/**/*.html", "./js/**/*.js"],
  theme: {
    extend: {},
  },
  darkMode: 'class',
  plugins: [
    require('daisyui')
  ],
  daisyui: {
    themes: ["business"],
    darkTheme: "business", // Set business theme as default
    base: true, // This ensures the theme is applied by default
    styled: true,
    utils: true
  }
}
