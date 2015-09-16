'use strict';

var gulp = require('gulp'),
		watch = require('gulp-watch'),
		prefixer = require('gulp-autoprefixer'),
		uglify = require('gulp-uglify'),
		sass = require('gulp-sass'),
		cssmin = require('gulp-minify-css'),
		rigger = require('gulp-rigger'),
		imagemin = require('gulp-imagemin'),
		pngquant = require('imagemin-pngquant'),
		notify = require('gulp-notify'),
		rename = require('gulp-rename'),
		spritesmith = require('gulp.spritesmith'),
		runSequence = require('run-sequence'),
		rimraf = require('rimraf'),
		newer = require('gulp-newer'),
		browserSync = require('browser-sync'),
		plumber = require('gulp-plumber'),
		reload = browserSync.reload;

// Error handler

var onError = function (err) {
		console.log(err);
		this.emit('end');
};


var path = {
		build: {
			html: 'build/',
			css: 'build/css/',
			js: 'build/js/',
			img: 'build/img/',
			sprites: 'build/img/sprites/',
			fonts: 'build/fonts/'
		},
		src: {
			html: 'dev/*.html',
			css: 'dev/scss/main.scss',
			js: 'dev/js/main.js',
			img: 'dev/img/**/*.*',
			sprites: 'dev/sprites/**/*.*',
			fonts: 'dev/fonts/**/*.*'
		},
		watch: {
			html: 'dev/**/*.html',
			css: 'dev/scss/**/*.scss',
			js: 'dev/js/**/*.js',
			img: 'dev/img/**/*.*',
			sprites: 'dev/sprites/**/*.*',
			fonts: 'dev/fonts/**/*.*'
		},
		clean: './build'
};

var config = {
		server: {
			baseDir: './build'
		},
		tunnel: true,
		host: 'localhost',
		port: 9000,
		logPrefix: 'Frontend_Alex'
};

gulp.task('html:build', function() {
	gulp.src(path.src.html)
		.pipe(gulp.dest(path.build.html))
		.pipe(reload({stream: true}))
		.pipe(notify('HTML compiled'));
});

gulp.task('css:build', function() {
	gulp.src(path.src.css)
	.pipe(plumber({
			errorHandler: onError
	}))
		.pipe(sass({
			includePaths: ['dev/sass/'],
			outputStyle: 'compressed',
			errLogToConsole: true
		}))
		.pipe(prefixer())
		.pipe(cssmin({
			keepSpecialComments: 0, restructuring: false, processImport: false
		}))
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest(path.build.css))
		.pipe(reload({stream: true}))
		.pipe(notify('CSS compiled'));
});

gulp.task('js:build', function() {
	gulp.src(path.src.js)
	.pipe(plumber({
			errorHandler: onError
	}))
		.pipe(rigger())
		.pipe(uglify())
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest(path.build.js))
		.pipe(reload({stream: true}))
		.pipe(notify('JS compiled'));
});

gulp.task('img:build', function() {
	gulp.src(path.src.img)
		.pipe(newer(path.build.img))
		.pipe(imagemin({
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()],
			interlaced: true
		}))
		.pipe(gulp.dest(path.build.img))
		.pipe(reload({stream: true}))
		.pipe(notify('Images minify'));
});

gulp.task('fonts:build', function() {
	gulp.src(path.src.fonts)
		.pipe(gulp.dest(path.build.fonts));
});

gulp.task('sprite:build', function () {
		var spriteData =
				gulp.src(path.src.sprites)
						.pipe(plumber({
								errorHandler: onError
						}))
						.pipe(spritesmith({
								imgName: 'sprite.png',
								imgPath: 'build/img/sprites/sprite.png',
								cssTemplate: 'dev/spritesmith.cssTemplate',
								cssName: 'sprite.scss',
								padding: 20,
								algorithm: 'binary-tree',
								cssFormat: 'css'
						}));

		spriteData.img.pipe(gulp.dest(path.build.sprites));
		return spriteData.css.pipe(gulp.dest('dev/scss/'))
		.pipe(notify('Sprite built'));
});

gulp.task('clean', function(cb) {
	rimraf(path.clean, cb);
});

gulp.task('build', function(callback) {
	runSequence('clean',
							['html:build', 'css:build', 'js:build', 'img:build'],
							'sprite:build',
							'fonts:build',
							callback);
});

gulp.task('webserver', function() {
	browserSync(config);
});

gulp.task('watch', function(callback){
	gulp.watch(path.watch.html, ['html:build']);
	gulp.watch(path.watch.js, ['js:build']);
	gulp.watch(path.watch.css, ['css:build']);
	gulp.watch(path.watch.img, ['img:build']);
	gulp.watch(path.watch.sprites, ['sprite:build']);
	gulp.watch(path.watch.fonts, ['fonts:build'])
});

gulp.task('default', function(callback) {
	runSequence('build', 'webserver', 'watch', callback);
});