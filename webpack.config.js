const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = [{
    entry: {
        popup: './js/popup/index.js',
        content: './js/content/index.js',
        background: './js/background.js',
        editor: './js/editor/index.js',
        processor: './js/processor.js'
    },
    output: {
        filename: '[name]-bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: '[name].css'
        })
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 1
                        }
                    },
                    'postcss-loader'
                ]
            }
        ]
    },
    optimization: {
        minimizer: [
            `...`,
            new CssMinimizerPlugin()
        ]
    },
    mode: 'production'
}];