/* eslint no-undef: "error" */
/* eslint-env node */

'use strict';

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

function clean() {
  return del(['build']);
}

function copy() {
  return gulp.src([
    'fonts/**/*.{woff,woff2,otf,ttf,eot}',
    'img/**'
  ], {
    base: '.'
  })
    .pipe(gulp.dest('build'));
}

function templates() {
  return gulp.src('pug/pages/*.pug')
    .pipe(plumber())
    .pipe(pug({
      pretty: true
    }))
    .pipe(gulp.dest('build'))
    .pipe(server.reload({
      stream: true
    }));
}

function styles() {
  return gulp.src('sass/style.scss')
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer({
        browsers: [
          'last 2 version'
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
}

function scripts() {
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
}

function images() {
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
}

function symbols() {
  return gulp.src('build/img/*.svg')
    .pipe(svgmin())
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename('symbols.svg'))
    .pipe(gulp.dest('build/img'));
}

function serve() {
  server.init({
    server: 'build',
    notify: false,
    open: true,
    ui: false
  });

  gulp.watch('pug/**/*.pug', templates);
  gulp.watch('sass/**/*.scss', styles);
  gulp.watch('js/**/*.js', scripts);
}

var build = gulp.series(
    clean,
    copy,
    gulp.parallel(
        templates,
        styles,
        scripts,
        images,
        symbols
    )
);

exports.clean = clean;
exports.copy = copy;
exports.templates = templates;
exports.styles = styles;
exports.scripts = scripts;
exports.images = images;
exports.symbols = symbols;
exports.serve = serve;

exports.default = build;
