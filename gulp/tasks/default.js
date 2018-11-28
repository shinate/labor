'use strict';

module.exports = function (gulp, PLUGIN, CONF) {
    gulp.task('default', ['build', 'release']);
    gulp.task('build', ['script', 'style']);
    gulp.task('watch', ['script:watch', 'style:watch']);
};