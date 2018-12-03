'use strict';

// var conf = require('json-config-reader').read('package.json');
// var fs = require('fs');
var path = require('path');
var through = require('through');
require('pretty-columns').injectConsole();

function nop() {
    return through();
}

var config = {};

config.root = '';

config.src = path.join(config.root, 'src');

config.dev = path.join(config.root, 'build');

config.release = path.join(config.root, 'build');

config.source = {
    script: {
        assets: {
            base: path.join(config.src, 'scripts/assets'),
            src: [
                path.join(config.src, 'scripts/assets/**/*')
            ],
            dev: path.join(config.dev, 'scripts/assets'),
            release: path.join(config.release, 'scripts/assets')
        },
        packed: {
            base: path.join(config.src, 'scripts'),
            src: [
                path.join(config.src, 'scripts/*.min.js')
            ],
            dev: path.join(config.dev, 'scripts'),
            release: path.join(config.release, 'scripts')
        },
        bundle: {
            base: path.join(config.root, 'a'),
            src: [
                path.join(config.root, 'a/**/*.bundle.js')
            ],
            dev: path.join(config.root, 'a'),
            release: path.join(config.root, 'a')
        }
    },
    style: {
        assets: {
            base: path.join(config.src, 'styles'),
            src: [
                path.join(config.src, 'styles/*.less')
            ],
            dev: path.join(config.dev, 'styles'),
            release: path.join(config.release, 'styles')
        },
        packed: {
            base: path.join(config.src, 'styles'),
            src: [
                path.join(config.src, 'styles/*.min.css')
            ],
            dev: path.join(config.dev, 'styles'),
            release: path.join(config.release, 'styles')
        },
        bundle: {
            base: path.join(config.root, 'a'),
            src: [
                path.join(config.root, 'a/**/*.bundle.less')
            ],
            dev: path.join(config.root, 'a'),
            release: path.join(config.root, 'a')
        }
    },
    html: {
        bundle: {
            base: path.join(config.root, 'a'),
            src: [
                path.join(config.root, 'a/**/*.bundle.html')
            ],
            dev: path.join(config.root, 'a'),
            release: path.join(config.root, 'a')
        }
    },
    manifest: {
        base: config.src,
        src: [
            path.join(config.src, 'manifest.json')
        ],
        dev: path.join(config.dev),
        release: path.join(config.release)
    },
    page: {
        base: config.src,
        src: [
            path.join(config.src, '**/*.html')
        ],
        dev: path.join(config.dev),
        release: path.join(config.release)
    },
    image: {
        base: path.join(config.src, 'image'),
        src: [
            path.join(config.src, 'image/**/*.{jpg,png,gif}')
        ],
        dev: path.join(config.dev, 'image'),
        release: path.join(config.release, 'image')
    }
};

config.ENV_PRODUCTION = 'production';
config.ENV_DEVELOPMENT = 'development';

config.env = config.ENV_PRODUCTION;

config.setEnv = function (p) {
    config.env = p && p.toLowerCase() === config.ENV_DEVELOPMENT ? config.ENV_DEVELOPMENT : config.ENV_PRODUCTION;
};

config.onProduction = function () {
    config.setEnv(config.ENV_PRODUCTION);
};

config.onDevelopment = function () {
    config.setEnv(config.ENV_DEVELOPMENT);
};

config.isProduction = function () {
    return config.env === config.ENV_PRODUCTION;
};

config.webpackConfig = function (p) {
    var c = {
        output: {
            filename: '[name].js'
        },
        resolve: {
            alias: {
                'jquery': path.resolve(config.src + '/scripts/model/jquery-bridge.js')
            }
        }
    };

    c.mode = config.env;

    if (!p) {
        c.devtool = 'source-map';
    }

    return c;
};

/**
 * Environmental coordinator
 *
 * @param productionCallbackFunc
 * @param developmentCallbackFunc
 * @returns {*}
 * @constructor
 */
config.EC = function (productionCallbackFunc, developmentCallbackFunc) {
    return config.isProduction() ? (productionCallbackFunc || nop()) : (developmentCallbackFunc || nop());
};

module.exports = config;

