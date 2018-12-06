var path = require('path');

module.exports = function (config) {
    return function (p) {
        var c = {
            output: {
                filename: '[name].js'
            },
            resolve: {
                alias: {
                    'jquery': path.resolve(config.src + '/scripts/model/jquery-bridge.js'),
                    'vue$': 'vue/dist/vue.esm.js'
                }
            },
            module: {
                rules: [
                    {
                        test: /\.html$/,
                        use: 'vue-template-loader'
                    },
                    {
                        test: /\.mjs$/,
                        exclude: /(node_modules|bower_components)/,
                        use: {
                            loader: 'babel-loader',
                            options: {
                                presets: ['@babel/preset-env', '@vue/app'],
                                plugins: ['@babel/plugin-proposal-object-rest-spread']
                            }
                        }
                    }
                ]
            }
        };

        c.mode = config.env;

        if (!p) {
            c.devtool = 'source-map';
        }

        return c;
    };
};