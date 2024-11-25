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
    themes: [{
      lofi: {
        ...require("daisyui/src/theming/themes")["lofi"],
        "primary": "#1C4E80",
        "secondary": "#7b92b2"
      },
    }, {
      business: {
        ...require("daisyui/src/theming/themes")["business"]

      }
    }],
    darkTheme: "business",
    lightTheme: "lofi",
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
