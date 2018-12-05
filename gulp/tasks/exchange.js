'use strict';

var named = require('vinyl-named');

module.exports = function (gulp, PLUGIN, CONF) {

    gulp.task('exchange:clean', function () {
        gulp.src([
            'a/**/*.bundle.*'
        ], {
            read: false
        })
            .pipe(PLUGIN.clean());
    });

    gulp.task('exchange:do', function () {
        gulp.src([
            'a/**/*.bundle.*'
        ])
            .pipe(named(function (file) {
                return file.path.replace('.bundle', '.dev');
            }))
            .pipe(gulp.dist('a'));
    });
};