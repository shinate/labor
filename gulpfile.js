'use strict';

var gulp = require('gulp');
var plugin = require('gulp-load-plugins')();
var config = require('./gulp/config.js');
var yargs = require('yargs');

config.setEnv(yargs.argv.env || process.env.npm_config_env);

var tasks = require('require-dir')('./gulp/tasks/');
for (var t in tasks) {
    tasks[t](gulp, plugin, config);
}