var gulp = (function () {
  var libName = require('./package.json')['lib_name'];
  var gulp = require('gulp');
  var gulpSourceMaps = require('gulp-sourcemaps');
  var gulpRename = require('gulp-rename');
  var gulpUglify = require('gulp-uglify');
  gulp.task('default', function () {
    gulp
      .src(['source/' + libName + '.js'])
      .pipe(gulpRename({
        extname: '.min.js'
      }))
      .pipe(gulpSourceMaps.init())
      .pipe(gulpUglify({
        compress: {
          sequences: false,
          unsafe: false,
          warnings: true
        }
      }))
      .pipe(gulpSourceMaps.write('.'))
      .pipe(gulp.dest('release'));
  });
  return gulp;
})();
