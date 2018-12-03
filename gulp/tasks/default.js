'use strict';

module.exports = function (gulp, PLUGIN, CONF) {
    gulp.task('default', ['build']);
    gulp.task('build', ['script', 'style', 'html']);
    gulp.task('watch', ['script:watch', 'style:watch']);
};