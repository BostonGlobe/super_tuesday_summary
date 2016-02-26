var gulp = require('gulp');
var smoosher = require('gulp-smoosher');

gulp.task('smoosh-prod', function() {
	return gulp.src('.tmp/index.html')
		.pipe(smoosher())
		.pipe(gulp.dest('dist'))
});