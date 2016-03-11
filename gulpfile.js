var gulp = require('gulp');
var $    = require('gulp-load-plugins')();

var sassPaths = [
];

gulp.task('sass', function() {
  return gulp.src('sass/app.scss')
    .pipe($.sass({
      includePaths: sassPaths
    })
    .on('error', $.sass.logError))
    .pipe($.autoprefixer({
      browsers: ['last 2 versions', 'ie >= 9']
    }))
    .pipe(gulp.dest('public/css'));
});

gulp.task('watch', function() {
  gulp.watch('sass/**/*.scss', ['sass']);
});

gulp.task('compile', ['sass']);
gulp.task('default', ['compile', 'watch']);  
