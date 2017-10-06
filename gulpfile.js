var autoprefixer = require('autoprefixer');
var server = require('browser-sync');
var mqpacker = require('css-mqpacker');
var del = require('del');
var gulp = require('gulp');
var plumber = require('gulp-plumber');
var postcss = require('gulp-postcss');
var sass = require('gulp-sass');
var minify = require('gulp-csso');
var rename = require('gulp-rename');
var imagemin = require('gulp-imagemin');
var svgstore = require('gulp-svgstore');
var svgmin = require('gulp-svgmin');
var pug = require('gulp-pug');
var concat = require('gulp-concat');
var jsminify = require('gulp-minify');
var run = require('run-sequence');

gulp.task('templates', function() {
  gulp.src('templates/*.pug')
    .pipe(plumber())
    .pipe(pug({
      pretty: true
    }))
    .pipe(gulp.dest('build'))
    .pipe(server.reload({
      stream: true
    }));
});

gulp.task('style', function() {
  gulp.src('sass/style.scss')
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer({
        browsers: [
          'last 1 version',
          'last 2 Chrome versions',
          'last 2 Firefox versions',
          'last 2 Opera versions',
          'last 2 Edge versions'
        ]
      }),
      mqpacker({
        sort: true
      })
    ]))
    .pipe(gulp.dest('build/css'))
    .pipe(minify())
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css'))
    .pipe(server.reload({
      stream: true
    }));
});

gulp.task('scripts', function() {
  return gulp.src('./js/*.js')
    .pipe(plumber())
    .pipe(concat('concatenated.js'))
    .pipe(jsminify({
      ext: {
        src: '.js',
        min: '.min.js'
      },
    }))
    .pipe(gulp.dest('./build/js'));
});

gulp.task('images', function() {
  return gulp.src('build/img/**/*.{png,jpg,gif,svg}')
    .pipe(imagemin([
      imagemin.optipng({
        optimizationLevel: 3
      }),
      imagemin.jpegtran({
        progressive: true
      }),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest('build/img'));
});

gulp.task('symbols', function() {
  return gulp.src('build/img/*.svg')
    .pipe(svgmin())
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename('symbols.svg'))
    .pipe(gulp.dest('build/img'));
});

gulp.task('serve', function() {
  server.init({
    server: 'build',
    notify: false,
    open: true,
    ui: false
  });

  gulp.watch('templates/**/*.pug', ['templates']);
  gulp.watch('sass/**/*.scss', ['style']);
  gulp.watch('js/**/*.js', ['scripts']);
});

gulp.task('clean', function() {
  return del('build');
});

gulp.task('copy', function() {
  return gulp.src([
      'fonts/**/*.{woff,woff2,otf,ttf,eot}',
      'img/**'
    ], {
      base: '.'
    })
    .pipe(gulp.dest('build'));
});

gulp.task('build', function(fn) {
  run(
    'clean',
    'templates',
    'style',
    'scripts',
    'copy',
    'images',
    'symbols',
    fn
  );
});
