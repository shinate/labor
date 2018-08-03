'use strict';

var named = require('vinyl-named');
var ws = require('webpack-stream');
var path = require('path');
var colors = require('colors');
var util = require('util');

module.exports = function (gulp, PLUGIN, CONF) {

    function watch(src, dist) {
        return PLUGIN.intelliWatch(src, function (src) {
            return gulp.src(src)
                .pipe(PLUGIN.plumber())
                .pipe(PLUGIN.sourcemaps.init())
                .pipe(PLUGIN.less())
                .pipe(named(function (file) {
                    file.base = CONF.root + 'a';
                    var filepath = path.relative(file.base, file.path);
                    console.log('[' + colors.grey((new Date).toTimeString()) + ']', 'LESS Bundle');
                    console.log([
                        (new Array(filepath.length - 4)).join(' ') + colors.bold('Asset'),
                        colors.bold('Size')
                    ].join(' '));
                    console.log([
                        colors.blue.bold(filepath),
                        (parseInt(file.stat.size / 10) / 100) + ' kB'
                    ].join(' '));
                    this.queue(file);
                }))
                .pipe(PLUGIN.sourcemaps.write('./'))
                .pipe(gulp.dest(dist));
        });
    }


    gulp.task('watch-dev', ['build-dev', 'js-dev:watch', 'css-dev:watch']);

    gulp.task('watch', ['js:dev:watch', 'css:dev:watch']);

    gulp.task('js:dev:watch', PLUGIN.intelliWatch([
        CONF.root + 'a/**/*.bundle.js',
        '!' + CONF.root + '/a/**/*.min.js'
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

    gulp.task('css:dev:watch', watch([
        CONF.root + 'a/**/*.less'
    ], CONF.root + 'a'));
};