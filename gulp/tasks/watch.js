'use strict';

var p = require('child-process-promise');

module.exports = function (gulp, PLUGIN, CONF) {
    gulp.task('jekyll', ['build'], function (cb) {
        p.exec('jekyll build')
            .then(function (result) {
                var stdout = result.stdout;
                console.log('stdout: ', stdout);
                cb();
            })
            .catch(function (err) {
                console.error('ERROR: ', err);
                cb();
            });
    });

    gulp.task('watch', function () {
        gulp.watch([
            CONF.src + '/**/*',
            '_config.yml',
            '_includes/**/*',
            '_layouts/**/*'
        ], ['jekyll']);
    });
};