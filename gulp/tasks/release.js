'use strict';

var execa = require('execa')
var colors = require('colors');

module.exports = function (gulp, PLUGIN, CONF) {
    gulp.task('release', function (cb) {
        try {
            execa.shellSync('git add .');
            execa.shellSync('git commit -m "release"');
            execa.shellSync('git push');
            console.log('[' + colors.grey((new Date()).toLocaleTimeString()) + ']', colors.bold.yellow('Release complete'));
        } catch (e) {
            console.log(e)
        }
        cb();
    });
};