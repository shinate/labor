'use strict';

var named = require('vinyl-named');
var path = require('path');
var colors = require('colors');

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

    gulp.task('css', function () {
        return gulp.src([
            CONF.root + 'a/**/*.less'
        ])
            .pipe(PLUGIN.plumber())
            .pipe(PLUGIN.less())
            .pipe(PLUGIN.cssmin())
            .pipe(PLUGIN.rename({
                suffix: '.min'
            }))
            .pipe(gulp.dest(CONF.root + 'a'));
    });

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

    gulp.task('css:dev:watch', watch([
        CONF.root + 'a/**/*.less'
    ], CONF.root + 'a'));
};