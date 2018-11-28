'use strict';

var execa = require('execa')

module.exports = function (gulp, PLUGIN, CONF) {
    gulp.task('release', function (cb) {
        try {
            execa.shellSync('git add .');
            execa.shellSync('git commit -m "release"');
            execa.shellSync('git push');
            console.log(new Date().toTimeString());
        } catch (e) {
            console.log(e)
        }
        cb();
    });
};