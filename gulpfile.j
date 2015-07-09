'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

var browserSync = require('browser-sync');



var filePath = {
    index: 'src/app/index',
    about: 'src/app/about',
    tmpIndex: 'tmp/index',
    tmpAbout: 'tmp/about'
};

var conf = {
    tmp: 'tmp',
    src: 'src'
};

gulp.task('copy',function(){
    return gulp.src('src/app/**/*.{css,js}')
            .pipe(gulp.dest(conf.tmp));
});


gulp.task('style', function() {
    console.log('css 编译')
    return gulp.src(conf.src + '/app/**/*.styl')
        .pipe($.stylus())
        .pipe(gulp.dest(conf.tmp))

});


gulp.task('inject',['copy'], function() {

    return gulp.src('src/app/*.html')
        .pipe($.inject(gulp.src(filePath.tmpIndex + '/*.{js,css}'), {
            name: 'inject:index',
            read:false
        }))
        .pipe($.inject(gulp.src(filePath.tmpAbout + '/*.{js,css}'), {
            name: 'inject:about',
            read:false
        }))
        .pipe(gulp.dest(conf.tmp))
});

gulp.task('build',['style','inject'], function() {

    var jsFilter = $.filter('**/*.js');
    var cssFilter = $.filter('**/*.css');

    var assets = $.useref.assets({
        searchPath: './'
    });

    return gulp.src('tmp/*.html')
        .pipe(assets)

        .pipe(jsFilter)
        .pipe($.uglify())
        .pipe(jsFilter.restore())

        .pipe(cssFilter)
        .pipe($.csso())
        .pipe(cssFilter.restore())

        .pipe($.rev())
        .pipe(assets.restore())
        .pipe($.useref())
        .pipe($.revReplace())

        .pipe(gulp.dest('dist'))
});



function browserSyncInit(baseDir, files) {

    var startPath = '/';

    browserSync.instance = browserSync.init(files, {
        startPath: startPath,
        server: {
            baseDir: baseDir
        },
        browser: 'default',
        injectChanges: true,
        reloadDebounce: 500
    });
}


gulp.task('watch', ['style', 'inject'], function() {
    gulp.watch('src/app/**/*.*', ['inject']).on('change',browserSync.reload);
    gulp.watch('src/app/**/*.styl', ['style']).on('change',browserSync.reload);
});



gulp.task('serve', ['watch'], function() {
    browserSyncInit([
        conf.tmp + '',
        './'
    ], []);
});



