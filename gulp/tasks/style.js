'use strict';

var named = require('vinyl-named');
var path = require('path');
var chalk = require('chalk');

module.exports = function (gulp, PLUGIN, CONF) {

    gulp.task('style:packed', function () {
        return gulp.src(CONF.source.style.packed.src)
            .pipe(PLUGIN.plumber())
            .pipe(gulp.dest(CONF.source.style.packed.release));
    });

    gulp.task('style:assets', function () {
        return gulp.src(CONF.source.style.assets.src)
            .pipe(PLUGIN.plumber())
            .pipe(PLUGIN.less())
            .pipe(PLUGIN.cssmin())
            .pipe(PLUGIN.rename({
                suffix: '.min'
            }))
            .pipe(gulp.dest(CONF.source.style.assets.release));
    });

    function styleBundle(src) {

        var buf = [];

        return gulp.src(src || CONF.source.style.bundle.src)
            .pipe(PLUGIN.plumber())
            .pipe(CONF.EC(null, PLUGIN.sourcemaps.init()))
            .pipe(PLUGIN.less())
            .pipe(CONF.EC(PLUGIN.cssmin()))
            .pipe(CONF.EC(PLUGIN.rename({
                suffix: '.min'
            })))
            .pipe(CONF.EC(null, PLUGIN.sourcemaps.write('./')))
            .pipe(named(function (file) {
                file.path = file.path.replace(/\.dev/, '');
                file.base = CONF.source.style.bundle.base;
                var filepath = path.relative(file.base, file.path);
                buf.push(chalk.blue.bold(filepath) + "\t" + (parseInt(file.contents.length / 10) / 100) + ' kB');
                this.queue(file);
            }))
            .pipe(gulp.dest(CONF.source.style.bundle.release))
            .on('end', function () {
                buf.push(chalk.bold('Asset') + "\t" + chalk.bold('Size'));

                console.log('[' + chalk.grey((new Date).toLocaleTimeString()) + ']', 'LESS Bundle');
                console.columns(buf.reverse(), {align: 'r'});
            });
    }

    gulp.task('style', ['style:assets', 'style:packed'], function () {
        return styleBundle();
    });

    gulp.task('style:watch', [
        'style:assets',
        'style:packed'
    ], PLUGIN.intelliWatch(CONF.source.style.bundle.src, styleBundle));
};