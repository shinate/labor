'use strict';

module.exports = function (gulp, PLUGIN, CONF) {
    gulp.task('topic', function () {
        return gulp.src([
                CONF.src + '/**/*.js',
                CONF.src + '/**/*.html',
            ])
            .pipe(gulp.dest('./'));
    });
};