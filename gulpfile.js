/* eslint-disable */

require('babel/register');

var gulp = require('gulp');
var babel = require('gulp-babel');
var eslint= require('gulp-eslint');
var mocha = require('gulp-mocha');
var runseq = require('run-sequence');
var del = require('del');
var httpServer = require('http-server');
var WatchRemotely = require('watch-remotely');

var CODE_SRC = ['./src/**/*.js'];
var TEST_SRC = ['./test/**/*.js'];

var EXAMPLE_ROOT = './example';
var EXAMPLE_PATH = 'example/hmr';

gulp.task('lint:code', function() {
  return gulp.src(CODE_SRC)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});

gulp.task('lint:test', function() {
  return gulp.src(TEST_SRC)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});

gulp.task('lint', ['lint:code', 'lint:test']);

gulp.task('test', function() {
  return gulp.src(TEST_SRC, { read: false }).pipe(mocha({ require: ['./test/bootstrap.unit.js'] }));
});

gulp.task('build', function() {
  return runseq('lint', 'test');
});

gulp.task('watch', ['build'], function() {
  gulp.watch(CODE_SRC, ['build']);
  gulp.watch(TEST_SRC, ['build']);
});

gulp.task('example:clean', function() {
  return del(EXAMPLE_PATH);
});

gulp.task('example:transpile', function() {
  return gulp.src(CODE_SRC)
    .pipe(babel({ modules: 'system' }))
    .pipe(gulp.dest(EXAMPLE_PATH));
});

gulp.task('example:build', function() {
  return runseq('example:clean', 'example:transpile');
});

gulp.task('example:watch', ['example:build'], function() {
  gulp.watch(CODE_SRC, ['example:build']);
});

gulp.task('example', ['example:watch'], function() {
  var server = httpServer.createServer({
    root: EXAMPLE_ROOT
  });
  var watcher = new WatchRemotely(EXAMPLE_ROOT, {
    basePath: EXAMPLE_ROOT,
    relativePaths: true,
    withContents: false
  });

  server.listen(8080, '127.0.0.1', function() {
    console.log('Start listening on http://127.0.0.1:8080');
  });
  watcher.run();
});
