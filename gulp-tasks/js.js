const gulp          = require('gulp');
const rename        = require('gulp-rename');
const browserSync   = require('browser-sync');
const webpackStream = require('webpack-stream');
const webpack       = require('webpack');
const plumber		= require('gulp-plumber');
const report 		= require('../report-error.js');
const argv        	= require('yargs').argv;

const config = {
	module: {
		loaders: [
			{ test: /\.csv?$/, loader: 'dsv-loader' },
			{ test: /\.json$/, loader: 'json-loader' },
			{ test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader'}
		],
		eslint: {
			configFile: '.eslintrc'
		}
	},
	plugins: [
		new webpack.DefinePlugin({
			'process.env.test': argv.test
		})
	]
};

const prod_config = Object.assign({}, config, {
	plugins: [
		new webpack.optimize.UglifyJsPlugin(),
		new webpack.optimize.OccurenceOrderPlugin(),
		new webpack.optimize.DedupePlugin(),
		new webpack.DefinePlugin({
			'process.env.test': argv.test
		})
	]
});

gulp.task('js-dev', function() {
	return gulp.src('src/dev/js/dev.js')
		.pipe(plumber({ errorHandler: report }))
		.pipe(webpackStream(config))
		.pipe(rename('bundle.js'))
		.pipe(gulp.dest('src'))
		.pipe(browserSync.reload({stream:true}));
});

gulp.task('js-prod', function() {
	return gulp.src('src/dev/js/dev.js')
		.pipe(webpackStream(prod_config))
		.pipe(rename('bundle.js'))
		.pipe(gulp.dest('.tmp'))
});
