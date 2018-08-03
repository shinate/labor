'use strict';

var named = require('vinyl-named');
var ws = require('webpack-stream');
var path = require('path');
var colors = require('colors');
var util = require('util');

module.exports = function (gulp, PLUGIN, CONF) {
    gulp.task('watch', ['js:dev:watch', 'css:dev:watch']);
};