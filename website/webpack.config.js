/* eslint-disable */
const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: {
        index: "./src/index.js",
    },
    output: {
        path: path.resolve(__dirname, "./dist"),
        filename: "[name].bundle.js",
    },
    devServer: {
        contentBase: path.join(__dirname, "dist"),
        port: 9000,
        host: "localhost",
        compress: true,
        hot: true,
        watchContentBase: true
    },
    module: {
        rules: [{
            test: /\.js$/,
            exclude: [/node_modules/],
            use: [{
                loader: "babel-loader",
                options: { presets: ["es2015"] },
            }]
        }]
    }
};
