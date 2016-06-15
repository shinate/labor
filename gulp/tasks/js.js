'use strict';

module.exports = function (gulp, PLUGIN, CONF) {

    var uglify = PLUGIN.uglify;

    gulp.task('js', function () {
        return gulp.src([
                CONF.src + '/**/*.js'
            ])
            .pipe(uglify())
            .pipe(gulp.dest('./'));
    });
};