'use strict';

var gulp = require('gulp');
var util=require('util');
var $ = require('gulp-load-plugins')();



var filePath = {
    index: 'src/app/index',
    about: 'src/app/about'
};

var conf = {
    tmp:'.tmp',
    src:'src'
};


gulp.task('style',function(){
    return gulp.src(conf.src+'/app/**/*.scss')
        .pipe($.sass())
        .pipe(gulp.dest(conf.tmp+'/css'));
});


gulp.task('inject', function() {


    return gulp.src('src/app/*.html')
        .pipe($.inject(gulp.src(filePath.index + '/**/*.js'), {
            name: 'inject:index'
        }))
        .pipe($.inject(gulp.src(filePath.about + '/**/*.js'), {
            name: 'inject:about'
        }))
        .pipe(gulp.dest('.tmp/'))

});


var browserSync = require('browser-sync');

// var middleware = require('./proxy');

function browserSyncInit(baseDir, files, isSpecRunner, browser) {
    browser = browser === undefined ? 'default' : browser;

    var routes = null;
    if (baseDir === conf.src || (util.isArray(baseDir) && baseDir.indexOf(conf.src) !== -1)) {
        routes = {
            '/bower_components': 'bower_components',
            '/node_modules': 'node_modules'
        };
    }

    var startPath = '/';
    if (isSpecRunner) {
        startPath += conf.specRunnerFile;
    }

    browserSync.instance = browserSync.init(files, {
        startPath: startPath,
        server: {
            baseDir: baseDir,
            routes: routes
        },
        browser: browser,
        ghostMode: {
            clicks: true,
            location: false,
            forms: true,
            scroll: true
        },
        injectChanges: true,
        reloadDelay: 1000
    });
}


gulp.task('watch',['inject','style'],function(){
    gulp.watch('src/app/**/*.*',['inject']);
    gulp.watch('src/app/**/*.scss',['style'])
});



gulp.task('serve', ['inject','watch'], function() {
    browserSyncInit([
        conf.tmp + '',
        './'
    ], []);
});



gulp.task('build', ['inject'], function() {

    //var assets = $.useref.assets();
    var jsFilter = $.filter('**/*.js');
    var cssFilter = $.filter('**/*.css');

    var assets = $.useref.assets({
        searchPath: './'
    });

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


