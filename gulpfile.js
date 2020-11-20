var gulp = require("gulp");
var browserify = require("browserify");
var source = require("vinyl-source-stream");
var tsify = require("tsify");
var sourcemaps = require("gulp-sourcemaps");
var buffer = require("vinyl-buffer");
var uglify = require("gulp-uglify");
var cssnano = require('gulp-cssnano')
var browserSync = require('browser-sync').create();
var sass = require('gulp-sass');

var THEME_NAME = "twentytwenty";
var THEMES_FOLDER = "C:\\xampp\\htdocs\\wordpress\\wp-content\\themes\\" + THEME_NAME;


var paths = {
  theme: ["src/theme/" + THEME_NAME + '/**'],
};

gulp.task("copy-files", function () {
  return gulp.src(paths.theme).pipe(gulp.dest(THEMES_FOLDER));
});


gulp.task(
  "bundle",
  function () {
    return browserify({
      basedir: ".",
      debug: true,
      entries: ["src/typescript/main.ts"],
      cache: {},
      packageCache: {},
    })
      .plugin(tsify)
      .transform("babelify", {
        presets: ["es2015"],
        extensions: [".ts"],
      })
      .bundle()
      .pipe(source("bundle.js"))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(uglify())
      .pipe(sourcemaps.write("./"))
      .pipe(gulp.dest("src/theme/" + THEME_NAME + '/assets/js'));
  }
);


gulp.task('browser-sync', function() {
  browserSync.init({
      //server: "./dist",
      proxy: "localhost/wordpress",

      port: 4000
  });
});

gulp.task('scss', function() {
  return gulp.src("src/scss/*.scss")
      .pipe(sourcemaps.init())
      .pipe(sass().on('error', sass.logError))
      .pipe(cssnano())
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest("src/theme/" + THEME_NAME + '/assets/css'))
      .pipe(browserSync.stream());
});

gulp.task('watch', function() {
  gulp.watch('src/scss/*.scss', gulp.series(gulp.parallel("scss")));
  gulp.watch('src/typescript/**', gulp.series(gulp.parallel("bundle")));
  gulp.watch("src/theme/" + THEME_NAME + "/assets/js/bundle.js").on("change", browserSync.reload);
  gulp.watch("src/theme/" + THEME_NAME + "/**.php").on("change", browserSync.reload);
});
 
gulp.task('default', gulp.series(gulp.parallel('bundle', 'scss'), gulp.parallel('copy-files','watch', 'browser-sync')));


