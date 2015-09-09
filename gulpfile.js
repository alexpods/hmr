require('babel/register');

var gulp    = require('gulp');
var babel   = require('gulp-babel');
var eslint  = require('gulp-eslint');
var mocha   = require('gulp-mocha');
var runseq  = require('run-sequence');
var del     = require('del');

var CODE_SRC = ['./src/Watchers/*.js'];
var TEST_SRC = ['./test/**/*.js'];

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
  return gulp.src(TEST_SRC, { read: false }).pipe(mocha());
});

gulp.task('build', function() {
  return runseq('lint', 'test');
});

gulp.task('watch', ['build'], function() {
  gulp.watch(CODE_SRC, ['build']);
  gulp.watch(TEST_SRC, ['build']);
});

//gulp.task('clean:example', function() {
//  return del(EXAMPLE_PATH);
//});
//
//gulp.task('build:example', function() {
//  return gulp.src('./src/**/*.js')
//    .pipe(babel({
//      modules: 'system'
//    }))
//    .pipe(gulp.dest(EXAMPLE_PATH));
//});

//gulp.task('watch', ['clean:example', 'build:example'], function() {
//  gulp.watch('./src/**/*.js', ['clean:example', 'build:example']);
//});