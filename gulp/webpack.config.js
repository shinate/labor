const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const terserPlugin = require('terser-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = function (config) {
    return function (p) {
        var c = {
            output : {
                filename: '[name].js'
            },
            resolve: {
                alias: {
                    'jquery': path.resolve(config.src + '/scripts/model/jquery-bridge.js'),
                    'vue$'  : 'vue/dist/vue.esm.js'
                }
            },
            module : {
                rules: [
                    {
                        test: /\.html$/,
                        use : 'vue-template-loader'
                    },
                    {
                        test  : /\.vue$/,
                        loader: 'vue-loader'
                    },
                    {
                        test   : /\.m?js$/,
                        exclude: /(node_modules|bower_components)/,
                        use    : {
                            loader : 'babel-loader',
                            options: {
                                presets: ['@babel/preset-env', '@vue/app'],
                                plugins: [
                                    // '@babel/plugin-transform-object-assign',
                                    '@babel/plugin-proposal-object-rest-spread'
                                ]
                            }
                        }
                    }
                ]
            },
            plugins: [
                // make sure to include the plugin for the magic
                new VueLoaderPlugin()
            ]
        };

        c.mode = config.env;

        if (!p) {
            c.devtool = 'source-map';
        } else {
            c.optimization = {
                minimizer: [new terserPlugin()]
            };
        }

        return c;
    };
};