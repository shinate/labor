'use strict';

// var conf = require('json-config-reader').read('package.json');

'use strict';

// var conf = require('json-config-reader').read('package.json');

var fs = require('fs');

var config = {
    root: './',
    config: './config',
    src: './src',
    build: './build'
};

config.webpack = function (dev) {
    var c = {
        output: {
            filename: '[name].js'
        },
        resolve: {
            alias: {
                'jquery': fs.realpathSync(config.src + '/scripts/model/jquery-bridge.js')
            }
        },
        mode: 'production'
    };

    if (dev) {
        c.devtool = 'source-map';
        c.mode = 'development';
    }

    return c;
};

module.exports = config;

