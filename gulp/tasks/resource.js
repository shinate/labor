'use strict';

module.exports = function (gulp, PLUGIN, CONF) {

    gulp.task('resources', ['resources-assets-direct'])

    gulp.task('resources-assets-direct', function () {
        return gulp.src([
            CONF.src + '/assets/{echarts,echarts4,clappr,editormd}/**/*'
        ])
            .pipe(PLUGIN.plumber())
            .pipe(gulp.dest(CONF.release + '/assets'));
    });
};