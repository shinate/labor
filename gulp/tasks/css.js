'use strict';

var through = require('through2');

module.exports = function (gulp, PLUGIN, CONF) {
    var cssmin = PLUGIN.cssmin;
    var rename = PLUGIN.rename;
    var less = PLUGIN.less;
    var add = PLUGIN.addSrc;

    gulp.task('css', function () {
        return gulp.src([
                CONF.src + '/style/style.less'
            ])
            .pipe(less())
            .pipe(add([
                CONF.src + '/style/*.css'
            ]))
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