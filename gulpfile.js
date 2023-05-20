'use strict';

const autoprefixer = require('autoprefixer');
const concat = require('gulp-concat');
const cssminify = require('gulp-csso');
const del = require('del');
const gulp = require('gulp');
const imagemin = require('gulp-imagemin');
const jsminify = require('gulp-minify');
const mqpacker = require('css-mqpacker');
const plumber = require('gulp-plumber');
const postcss = require('gulp-postcss');
const pug = require('gulp-pug');
const rename = require('gulp-rename');
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const svgmin = require('gulp-svgmin');
const svgstore = require('gulp-svgstore');
const sync = require('browser-sync').create();
const webp = require('gulp-webp');

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

const build = gulp.series(
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
