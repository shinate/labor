'use strict';

var conf = require('json-config-reader').read('package.json');

conf.src = './src';
conf.dist = './assets';
conf.dev = conf.src + '/dev';
conf.bower = './bower_components';
conf.icons = './icons';
conf.build = './assets';

module.exports = conf;