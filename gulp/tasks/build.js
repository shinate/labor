'use strict';

module.exports = function (gulp, PLUGIN, CONF) {
    gulp.task('build', ['css', 'js', 'resources', 'fonts', 'images'/*, 'version', 'bridge'*/]);
    gulp.task('build-dev', ['css-dev', 'js-dev', 'fonts-dev', 'images-dev']);
};