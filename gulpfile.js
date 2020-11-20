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
var argv = require('yargs').argv;
var gulpif = require('gulp-if');
var clean = require('gulp-clean');



var THEME_NAME = "twentytwenty";
var THEMES_FOLDER = "C:\\xampp\\htdocs\\wordpress\\wp-content\\themes\\" + THEME_NAME;
var LOCAL_THEMES_FOLDER = 'src/theme/' + THEME_NAME;



gulp.task("copy-files", function () {
  var files =  [LOCAL_THEMES_FOLDER + '/**'];
  return gulp.src(files).pipe(gulp.dest(THEMES_FOLDER));
});


gulp.task('clean', function () {
  var files = [
    LOCAL_THEMES_FOLDER + '/assets/js/**.map',
    LOCAL_THEMES_FOLDER + '/assets/css/**.map'
  ];

  return gulp.src(files, {read: false})
      .pipe(clean());
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
      .pipe(gulpif(!argv.build, sourcemaps.init({ loadMaps: true })))
      .pipe(uglify())
      .pipe(gulpif(!argv.build, sourcemaps.write('.')))
      .pipe(gulp.dest(LOCAL_THEMES_FOLDER + '/assets/js'));
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
      .pipe(gulpif(!argv.build, sourcemaps.init()))
      .pipe(sass().on('error', sass.logError))
      .pipe(cssnano())
      .pipe(gulpif(!argv.build, sourcemaps.write('.')))
      .pipe(gulp.dest(LOCAL_THEMES_FOLDER + '/assets/css'))
      .pipe(browserSync.stream());
});

gulp.task('watch', function() {
  gulp.watch('src/scss/**', gulp.series(gulp.parallel("scss")));
  gulp.watch('src/typescript/**', gulp.series(gulp.parallel("bundle")));
  gulp.watch(LOCAL_THEMES_FOLDER + "/assets/js/bundle.js").on("change", browserSync.reload);
  gulp.watch(LOCAL_THEMES_FOLDER + "/**.php").on("change", browserSync.reload);
});
 
gulp.task('default', gulp.series(gulp.parallel('bundle', 'scss'), gulp.parallel('copy-files','watch', 'browser-sync')));
gulp.task('build', gulp.series(gulp.parallel('bundle', 'scss', 'clean'), gulp.parallel('copy-files')));


