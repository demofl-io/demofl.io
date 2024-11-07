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
},
{
    entry: './js/editor/index.js', // Ensure editor.js is included
    output: {
        filename: 'editor-bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
      rules: [
          // Other loaders (e.g., for CSS)
          {
              test: /\.json$/,
              type: 'json'
          }
      ]
  },
  resolve: {
      extensions: ['.js', '.json']
  },
    mode: 'production',
},
{
    entry: './js/processor.js',
    output: {
        filename: 'processor-bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    mode: 'production',
}];

