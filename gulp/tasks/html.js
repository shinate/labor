'use strict';

var named = require('vinyl-named');
var path = require('path');
var chalk = require('chalk');
var map = require('map-stream');

module.exports = function (gulp, PLUGIN, CONF) {

    function htmlBundle(src) {

        var buf = [];

        return gulp.src(src || CONF.source.html.bundle.src)
            .pipe(PLUGIN.plumber())
            .pipe(named(function (file) {
                file.path = file.path.replace(/\.dev/, '');
                file.base = CONF.source.html.bundle.base;
                var filepath = path.relative(file.base, file.path);
                buf.push(chalk.keyword('orange').bold(filepath) + "\t" + (parseInt(file.contents.length / 10) / 100) + ' kB');
                this.queue(file);
            }))
            .pipe(map(function (file, cb) {
                var contents = file.contents.toString();
                var regex = new RegExp('<script[^>]+bundle="on"[^>]*><\/script>|<link[^>]+bundle="on"[^>]*>', 'g');
                var r, res = [];
                while (r = regex.exec(contents)) {
                    var f = r[0].match('(src|href)="([^"]+)"');
                    f[2] = f[2].replace(path.extname(f[2]), '.min' + path.extname(f[2]));

                    res.push([r[0], r[0].replace(' bundle="on"', '').replace(f[0], f[1] + '="' + f[2] + '"')]);
                }
                res.length && res.forEach(function (r) {
                    contents = contents.replace(r[0], r[1]);
                });
                file.contents = new Buffer(contents, 'utf8');
                cb(null, file);
            }))
            .pipe(gulp.dest(CONF.source.html.bundle.release))
            .on('end', function () {
                buf.push(chalk.bold('Asset') + "\t" + chalk.bold('Size'));

                console.log('[' + chalk.grey((new Date).toLocaleTimeString()) + ']', 'HTML Bundle');
                console.columns(buf.reverse(), {align: 'r'});
            });
    }

    gulp.task('html', function () {
        return htmlBundle();
    });

    gulp.task('html:watch', PLUGIN.intelliWatch(CONF.source.style.bundle.src, htmlBundle));
};