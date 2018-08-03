'use strict';

module.exports = function (gulp, PLUGIN, CONF) {

    var clean = PLUGIN.clean;

    gulp.task('clean', function () {
        gulp.src([
            CONF.build + '/*',
            '!' + CONF.build + '/.gitignore'
        ], {
            read: false
        })
            .pipe(clean());
    });
};