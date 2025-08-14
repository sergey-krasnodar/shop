const {src, dest, watch,series, parallel} = require('gulp');

const scss = require('gulp-sass')(require('sass'));
const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const clean = require('gulp-clean');
const imagemin = require('gulp-imagemin');
const webp = require('gulp-webp');
const avif = require('gulp-avif');
const newer = require('gulp-newer');
const ttf2woff2 = require('gulp-ttf2woff2');
const include = require('gulp-include');
const svgstore = require('gulp-svgstore');

function sprites() {
  return src('app/images/sprite/*.svg')
    .pipe(svgstore())
    .pipe(dest('app/images'))
}

function pages() {
  return src('app/pages/*.html')
    .pipe(include({
      includePaths: 'app/components'
    }))
    .pipe(dest('app'))
    .pipe(browserSync.stream())
}


function fonts() {
  return src('app/fonts/*.ttf')
    .pipe(ttf2woff2())
    .pipe(dest('app/fonts'))
}

function images() {
  return src(['app/images/src/*.*', '!app/images/src/*.svg'])
    .pipe(newer('app/images'))
    .pipe(avif({quality: 50}))
    
    .pipe(src('app/images/src/*.*'))
    .pipe(newer('app/images'))
    .pipe(webp())
    
    .pipe(src('app/images/src/*.*'))
    .pipe(newer('app/images'))
    .pipe(imagemin())

    .pipe(dest('app/images'))
}


function styles() {
  return src('app/scss/style.scss')
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 10 versions']
    }))
    .pipe(concat('style.min.css'))
    .pipe(scss({style: 'compressed'}))
    .pipe(dest('app/css'))
    .pipe(browserSync.stream())
}

function scripts() {
  return src([
    'app/js/main.js'
  ])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js'))
    .pipe(browserSync.stream())
}

function watching() {
  browserSync.init({
    server: {
      baseDir: 'app/'
    }
  });
  watch(['app/scss/style.scss'],styles)
  watch(['app/images/src'], images)
  watch(['app/images/sprite'], sprites)
  watch(['app/pages/*', 'app/components/*'], pages)
  watch(['app/js/main.js'],scripts)
  watch(['app/*.html']).on('change', browserSync.reload)
}

function cleanDist() {
  return src('dist')
    .pipe(clean())
}

function building() {
  return src([
    'app/*.html',
    'app/js/main.min.js',
    'app/css/style.min.css',
    'app/images/*.*',
    'app/fonts/*.woff2'
  ], {base: 'app'})
    .pipe(dest('dist'))
}


exports.styles = styles;
exports.watching = watching;
exports.scripts = scripts;
exports.building = building;
exports.cleanDist = cleanDist;
exports.images = images;
exports.sprites = sprites;
exports.pages = pages;
exports.fonts = fonts;

exports.build = series(cleanDist, building);
exports.default = parallel(styles, pages, sprites, images, scripts, watching);


