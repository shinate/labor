'use strict';

module.exports = function (gulp, PLUGIN, CONF) {
    gulp.task('build', ['css', 'js', 'topic']);
};