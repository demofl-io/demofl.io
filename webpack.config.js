const path = require('path');

module.exports = {
  entry: './js/content/index.js',
  output: {
    filename: 'content-bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  mode: 'production',
};