const path = require('path');

module.exports = [{
  entry: './js/content/index.js',
  output: {
    filename: 'content-bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  mode: 'production',
},
{
  entry: './js/popup/index.js',
  output: {
    filename: 'popup-bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  mode: 'production',
},
{
  entry: './js/background.js',
  output: {
    filename: 'background-bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  mode: 'production',
}];

