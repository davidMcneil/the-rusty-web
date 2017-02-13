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
        }, {
            test: /\.css$/,
            loaders: ["style-loader", "css-loader"]
        }, {
            test: /\.(eot|svg|ttf|woff|woff2)$/,
            use: [{
                loader: "file-loader",
                options: { name: "fonts/[name]-[hash].[ext]" }
            }]
        }, {
            test: /\.(gif|png|jpe?g|svg)$/,
            use: [{
                loader: "file-loader",
                options: { name: "images/[name]-[hash].[ext]" }
            }]
        }]
    },
    plugins: [
        new webpack.ProvidePlugin({
            jQuery: "jquery",
            $: "jquery",
            jquery: "jquery"
        })
    ]
};
