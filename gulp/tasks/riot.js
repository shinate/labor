'use strict';

module.exports = function (gulp, PLUGIN, CONF) {

    var riot = PLUGIN.riot;

    gulp.task('riot', function () {
        return gulp.src([
                CONF.src + '/**/*.tag'
            ])
            .pipe(riot())
            .pipe(gulp.dest('./'));
    });
};