var gulp = require('gulp');
var runSequence = require('run-sequence');

gulp.task('prod', function() {
	runSequence(
		'assets-prod',
		'js-prod',
		'css-prod',
		'html-prod',
		'smoosh-prod'
	);
});