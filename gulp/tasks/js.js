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
        return gulp.src([
            CONF.root + 'a/**/*.bundle.js',
            '!' + CONF.root + 'a/**/*.min.js'
        ])
            .pipe(PLUGIN.plumber())
            .pipe(named(function (file) {
                var p = path.relative(file.base, file.path);
                return path.relative(CONF.root + 'a', file.base) + '/' + p.slice(0, -10);
            }))
            .pipe(ws(CONF.webpack(0)))
            .pipe(PLUGIN.rename({
                suffix: '.min'
            }))
            .pipe(gulp.dest(CONF.root + 'a'));
    });

    gulp.task('js:dev:watch', PLUGIN.intelliWatch([
        CONF.root + 'a/**/*.bundle.js',
        '!' + CONF.root + 'a/**/*.min.js'
    ], function (src) {
        return gulp.src(src)
            .pipe(PLUGIN.plumber())
            .pipe(named(function (file) {
                var p = path.relative(file.base, file.path);
                return path.relative(CONF.root + 'a', file.base) + '/' + p.slice(0, -10);
            }))
            .pipe(ws(CONF.webpack(1)))
            .pipe(gulp.dest(CONF.root + 'a'));
    }));
};