const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const OpenBrowserWebpackPlugin = require('open-browser-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const { CheckerPlugin: TsCheckerPlugin } = require('awesome-typescript-loader');

const webpackDevMiddlewareScript = 'webpack-hot-middleware/client?reload=true&noInfo=true';

module.exports = {
    devtool: 'source-map',
    entry: {
        index: [
            path.resolve(__dirname, 'src/index.ts'),
            webpackDevMiddlewareScript
        ]
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].bundle.js',
        publicPath: '/'
    },
    resolve: {
        extensions: ['.ts', '.js', '.json', './css']
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                include: [path.resolve(__dirname, 'src')],
                loader: 'awesome-typescript-loader'
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: 'css-loader'
                })
            }
        ]
    },
    plugins: [
        new TsCheckerPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.optimize.ModuleConcatenationPlugin(),
        new ExtractTextPlugin('[name].css'),
        new HtmlWebpackPlugin({
            title: 'canvas gaming',
            template: path.resolve(__dirname, 'src/index.html')
        }),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('development'),
            }
        }),
        new OpenBrowserWebpackPlugin({ url: 'http://127.0.0.1:9000/' })
    ],
    node: {
        fs: 'empty',
        net: 'empty'
    }
}