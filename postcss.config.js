module.exports = {
  plugins: {
    "@tailwindcss/postcss": {},

    cssnano: {
      preset: ['default', {
        discardComments: {
          removeAll: true,
        },
        normalizeWhitespace: true,
        minifyFontValues: true,
        colormin: true,
        calc: false // Disable calc optimization to avoid the infinity * 1px errors
      }]
    }
  }
}