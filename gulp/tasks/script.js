'use strict';

var ws = require('webpack-stream');
var named = require('vinyl-named');
var path = require('path');

module.exports = function (gulp, PLUGIN, CONF) {

    function scriptAsset() {
        return gulp.src(CONF.source.script.assets.src)
            .pipe(PLUGIN.plumber())
            .pipe(gulp.dest(CONF.source.script.assets.release));
    }

    gulp.task('script:asset', scriptAsset);

    function scriptPacked() {
        return gulp.src(CONF.source.script.packed.src)
            .pipe(PLUGIN.plumber())
            .pipe(gulp.dest(CONF.source.script.packed.release));
    }

    gulp.task('script:packed', scriptPacked);

    function scriptBundle(src) {
        return gulp.src(src || CONF.source.script.bundle.src)
            .pipe(PLUGIN.plumber())
            .pipe(named(function (file) {
                return path.relative(CONF.source.script.bundle.base, file.path).slice(0, -7);
            }))
            .pipe(ws(CONF.webpackConfig(CONF.isProduction())))
            .pipe(CONF.EC(PLUGIN.uglify()))
            .pipe(CONF.EC(PLUGIN.rename({
                suffix: '.min'
            })))
            .pipe(gulp.dest(CONF.source.script.bundle.release));
    }

    gulp.task('script', ['script:asset', 'script:packed'], function () {
        return scriptBundle();
    });

    gulp.task('script:watch', [
        'script:asset',
        'script:packed'
    ], PLUGIN.intelliWatch(CONF.source.script.bundle.src, scriptBundle));
};