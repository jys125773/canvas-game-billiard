const path = require('path');
const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');

const webpackConfig = require('./webpack.config.dev');
const compiler = webpack(webpackConfig);

const app = express();

app.use(webpackDevMiddleware(compiler, {
    hot: true,
    noInfo: false,
    stats: { colors: true },
    publicPath: webpackConfig.output.publicPath
}));

app.use(webpackHotMiddleware(compiler));

app.use('/public', express.static(path.resolve(__dirname, 'public')));

app.listen(9000, err => {
    if (err) {
        console.log(err.message);
    } else {
        console.log(`dev-server is running at "127.0.0.1:9000"`);
    }
});