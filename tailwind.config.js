module.exports = {
  content: [
    "./html/**/*.html",
    "./js/**/*.js"
  ],
  theme: {
    extend: {},
  },
  darkMode: 'class',
  plugins: [
    require('daisyui')
  ],
  daisyui: {
    themes: ["dark", "business"],
    darkTheme: "business",
    base: true,
    styled: true,
    utils: true
  },
  purge: {
    enabled: true,
    content: [
      "./html/**/*.html",
      "./js/**/*.js"
    ],
    options: {
      safelist: [],
      blocklist: [],
      keyframes: true,
      fontFace: true
    }
  }
}
