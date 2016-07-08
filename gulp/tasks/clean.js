'use strict';

module.exports = function (gulp, PLUGIN, CONF) {
    var clean = PLUGIN.clean;

    gulp.task('clean', function () {
        return gulp.src([
            './tools'
        ]).pipe(PLUGIN.clean());
    });
};