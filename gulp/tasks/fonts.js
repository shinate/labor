'use strict';

module.exports = function (gulp, PLUGIN, CONF) {
    gulp.task('fonts', function () {
        return gulp.src([
            CONF.src + '/fonts/*',
        ])
            .pipe(PLUGIN.plumber())
            .pipe(gulp.dest(CONF.release + '/fonts'));
    });
};