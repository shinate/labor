'use strict';

var through = require('through2')

module.exports = function (gulp, PLUGIN, CONF) {
    var cssmin = PLUGIN.cssmin;
    var rename = PLUGIN.rename;
    var less = PLUGIN.less;

    gulp.task('css', function () {
        return gulp.src([
                CONF.src + '/style/style.less'
            ])
            .pipe(less())
            .pipe(cssmin())
            .pipe(rename({'suffix': '.min'}))
            .pipe(through.obj(function (file, enc, cb) {
                file.contents = new Buffer('---\n---\n' + file.contents.toString());
                this.push(file);
                return cb();
            }))
            .pipe(gulp.dest(CONF.build + '/css/'));
    });
};