import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import browserSync from 'browser-sync';
import del from 'del';

const $=gulpLoadPlugins();
const reload = browserSync.reload;


var filePath = {
    tmpIndex: 'tmp/index',
    tmpAbout: 'tmp/about'
};

var conf = {
    tmp: 'tmp',
    src: 'src'
};


gulp.task('copy',() => {
    return gulp.src(conf.src + '/app/**/*.{css,js}')
        .pipe(gulp.dest(conf.tmp));
});


gulp.task('style', () => {
    return gulp.src(conf.src + '/app/**/*.styl')
        .pipe($.stylus())
        .pipe(gulp.dest(conf.tmp))
});


gulp.task('inject', ['copy'], () => {

    return gulp.src('src/app/*.html')
        .pipe($.inject(gulp.src(filePath.tmpIndex + '/*.{js,css}'), {
            name: 'inject:index',
            read: false
        }))
        .pipe($.inject(gulp.src(filePath.tmpAbout + '/*.{js,css}'), {
            name: 'inject:about',
            read: false
        }))
        .pipe(gulp.dest(conf.tmp))
});

gulp.task('build', ['style', 'inject'], () => {

    const jsFilter = $.filter('**/*.js');
    const cssFilter = $.filter('**/*.css');

    const assets = $.useref.assets({
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



let browserSyncInit = (baseDir, files) => {

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


gulp.task('watch', ['style', 'inject'], () => {
    gulp.watch('src/app/**/*.*', ['inject']).on('change', reload);
    gulp.watch('src/app/**/*.styl', ['style']).on('change', reload);
});



gulp.task('serve', ['watch'], () => {
    browserSyncInit([
        conf.tmp + '',
        './'
    ], []);
});
