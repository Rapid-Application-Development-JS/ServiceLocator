var gulp = (function () {
	var config = require('./config.json');
	var libName = config['name'];
	var folderCompiled = config['folderCompiled'];
	var folderSource = config['folderSource'];
	var gulp = require('gulp');
	var gulpSourceMaps = require('gulp-sourcemaps');
	var gulpRename = require('gulp-rename');
	var gulpUglify = require('gulp-uglify');
	gulp.task('default', function () {
		gulp
			.src([folderSource + '/' + libName + '.js'])
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
			.pipe(gulp.dest(folderCompiled));
	});
	gulp.task('watch', function () {
		gulp.watch('./' + folderSource, ['default']);
	});
	return gulp;
})();
