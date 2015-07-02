'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();



var filePath = {
    index: 'app/index',
    about: 'app/about'
};


gulp.task('inject', function() {

  return gulp.src('app/*.html')
        .pipe($.inject(gulp.src(filePath.index + '/**/*.js'), {
            name: 'inject:index'
        }))
        .pipe($.inject(gulp.src(filePath.about + '/**/*.js'), {
            name: 'inject:about'
        }))
        .pipe(gulp.dest('.tmp/'))

});

gulp.task('build', ['inject'], function(){

  //var assets = $.useref.assets();
  var jsFilter = $.filter('**/*.js');
  var cssFilter = $.filter('**/*.css');

  var assets = $.useref.assets({searchPath: './'});
  return gulp.src('.tmp/*.html')
         .pipe(assets)
         .pipe(jsFilter)
         .pipe($.uglify())
         .pipe(jsFilter.restore())
         .pipe($.rev())
         .pipe(assets.restore())
         .pipe($.useref())
         .pipe($.revReplace())
         .pipe(gulp.dest('dist'));
});


