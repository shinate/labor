'use strict';

var ws = require('webpack-stream');
var named = require('vinyl-named');
var path = require('path');

module.exports = function (gulp, PLUGIN, CONF) {

    gulp.task('js-asset', ['js-asset-bundle'], function () {
        return gulp.src([
            CONF.src + '/scripts/*.min.js'
        ])
            .pipe(PLUGIN.plumber())
            .pipe(gulp.dest(CONF.build + '/scripts'));
    });

    gulp.task('js-asset-bundle', function () {
        return gulp.src([
            CONF.src + '/scripts/*.js',
            '!' + CONF.src + '/scripts/*.min.js'
        ])
            .pipe(PLUGIN.plumber())
            .pipe(named(function (file) {
                var p = path.relative(file.base, file.path);
                return p.slice(0, -path.extname(p).length);
            }))
            .pipe(ws(CONF.webpack(0)))
            .pipe(PLUGIN.uglify())
            .pipe(PLUGIN.rename({
                suffix: '.min'
            }))
            .pipe(gulp.dest(CONF.build + '/scripts'));
    });

    gulp.task('js', ['js-asset'], function () {
        return gulp.src(CONF.src + '/scripts/**/*.bundle.js')
            .pipe(PLUGIN.plumber())
            .pipe(named(function (file) {
                var p = path.relative(file.base, file.path);
                return p.slice(0, -path.extname(p).length);
            }))
            .pipe(ws(CONF.webpack(0)))
            .pipe(PLUGIN.uglify())
            .pipe(PLUGIN.rename({
                suffix: '.min'
            }))
            .pipe(gulp.dest(CONF.build + '/scripts'));
    });

    gulp.task('js-dev', ['js-asset'], function () {
        return gulp.src(CONF.src + '/scripts/**/*.bundle.js')
            .pipe(PLUGIN.plumber())
            .pipe(named(function (file) {
                var p = path.relative(file.base, file.path);
                return p.slice(0, -path.extname(p).length);
            }))
            .pipe(ws(CONF.webpack(1)))
            .pipe(PLUGIN.rename({
                suffix: '.min'
            }))
            .pipe(gulp.dest(CONF.build + '/scripts'));
    });
};