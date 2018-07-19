'use strict';

module.exports = function (gulp, PLUGIN, CONF) {

    gulp.task('css-bundled', function () {
        return gulp.src([
            CONF.src + '/styles/*.min.css'
        ])
            .pipe(PLUGIN.plumber())
            .pipe(gulp.dest(CONF.build + '/styles'));
    });

    gulp.task('css-asset', function () {
        return gulp.src([
            CONF.src + '/styles/*.css',
            '!' + CONF.src + '/styles/*.min.css'
        ])
            .pipe(PLUGIN.plumber())
            .pipe(PLUGIN.cssmin())
            .pipe(PLUGIN.rename({
                suffix: '.min'
            }))
            .pipe(gulp.dest(CONF.build + '/styles'));
    });

    gulp.task('css', ['css-bundled', 'css-asset'], function () {
        return gulp.src([
            CONF.src + '/styles/**/*.less'
        ])
            .pipe(PLUGIN.plumber())
            .pipe(PLUGIN.less())
            .pipe(PLUGIN.cssmin())
            .pipe(PLUGIN.rename({
                suffix: '.min'
            }))
            .pipe(gulp.dest(CONF.build + '/styles'));
    });

    gulp.task('css-asset-dev', function () {
        return gulp.src([
            CONF.src + '/styles/*.css',
            '!' + CONF.src + '/styles/*.min.css'
        ])
            .pipe(PLUGIN.plumber())
            .pipe(PLUGIN.sourcemaps.init())
            .pipe(PLUGIN.less())
            .pipe(PLUGIN.sourcemaps.write('./'))
            .pipe(gulp.dest(CONF.build + '/styles'));
    });

    gulp.task('css-dev', ['css-bundled', 'css-asset-dev'], function () {
        return gulp.src([
            CONF.src + '/styles/**/*.less'
        ])
            .pipe(PLUGIN.plumber())
            .pipe(PLUGIN.sourcemaps.init())
            .pipe(PLUGIN.less())
            .pipe(PLUGIN.sourcemaps.write('./'))
            .pipe(gulp.dest(CONF.build + '/styles'));
    });
};