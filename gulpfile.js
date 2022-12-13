'use strict';

var autoprefixer = require('autoprefixer');
var concat = require('gulp-concat');
var cssminify = require('gulp-csso');
var del = require('del');
var gulp = require('gulp');
var imagemin = require('gulp-imagemin');
var jsminify = require('gulp-minify');
var objectfit = require('postcss-object-fit-images');
var mqpacker = require('css-mqpacker');
var plumber = require('gulp-plumber');
var postcss = require('gulp-postcss');
var pug = require('gulp-pug');
var rename = require('gulp-rename');
var sass = require('gulp-sass')(require('sass'));
var sourcemaps = require('gulp-sourcemaps');
var svgmin = require('gulp-svgmin');
var svgstore = require('gulp-svgstore');
var sync = require('browser-sync').create();
var webp = require('gulp-webp');

function clean() {
  return del(['build']);
}

function copy() {
  return gulp
    .src(['fonts/**/*.{woff,woff2,otf,ttf,eot}', 'img/**'], {
      base: '.',
    })
    .pipe(gulp.dest('build'));
}

function templates() {
  return gulp
    .src('pug/pages/*.pug')
    .pipe(plumber())
    .pipe(
      pug({
        pretty: true,
      })
    )
    .pipe(gulp.dest('build'))
    .pipe(sync.stream());
}

function styles() {
  return gulp
    .src('sass/style.scss')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass.sync())
    .pipe(
      postcss([
        autoprefixer(),
        objectfit(),
        mqpacker({
          sort: true,
        }),
      ])
    )
    .pipe(gulp.dest('build/css'))
    .pipe(cssminify())
    .pipe(rename('style.min.css'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('build/css'))
    .pipe(sync.stream());
}

function scripts() {
  return gulp
    .src('./js/*.js')
    .pipe(plumber())
    .pipe(concat('concatenated.js'))
    .pipe(
      jsminify({
        ext: {
          src: '.js',
          min: '.min.js',
        },
      })
    )
    .pipe(gulp.dest('./build/js'))
    .pipe(sync.stream());
}

function images() {
  return gulp
    .src('build/img/**/*.{png,jpg,gif,svg}')
    .pipe(
      imagemin([
        imagemin.optipng({
          optimizationLevel: 3,
        }),
        imagemin.mozjpeg({
          quality: 100,
          progressive: true,
        }),
        imagemin.svgo({
          plugins: [
            {
              removeViewBox: false,
            },
          ],
        }),
      ])
    )
    .pipe(gulp.dest('build/img'));
}

function createWebp() {
  return gulp
    .src('build/img/**/*.{png,jpg}')
    .pipe(webp({ quality: 90 }))
    .pipe(gulp.dest('build/img'));
}

function symbols() {
  return gulp
    .src('build/img/*.svg')
    .pipe(svgmin())
    .pipe(
      svgstore({
        inlineSvg: true,
      })
    )
    .pipe(rename('symbols.svg'))
    .pipe(gulp.dest('build/img'));
}

function server() {
  sync.init({
    server: 'build',
    notify: false,
    open: true,
    cors: true,
    ui: false,
  });

  gulp.watch('pug/**/*.pug', templates);
  gulp.watch('sass/**/*.scss', styles);
  gulp.watch('js/**/*.js', scripts);
}

var build = gulp.series(
  clean,
  copy,
  templates,
  styles,
  scripts,
  images,
  createWebp,
  symbols
);

exports.clean = clean;
exports.copy = copy;
exports.templates = templates;
exports.styles = styles;
exports.scripts = scripts;
exports.images = images;
exports.webp = createWebp;
exports.symbols = symbols;
exports.server = server;

exports.default = build;
