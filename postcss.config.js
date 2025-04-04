module.exports = {
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
    require('cssnano')({
      preset: ['default', {
        discardComments: {
          removeAll: true,
        },
        normalizeWhitespace: true,
        minifyFontValues: true,
        colormin: true,
        calc: false // Disable calc optimization to avoid the infinity * 1px errors
      }]
    }),
  ]
}