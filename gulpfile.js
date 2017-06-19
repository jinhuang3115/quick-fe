/**
 * Created by jin.huang on 2017/6/16.
 */
const gulp = require('gulp');
const path = require('path');
const watch = require('gulp-watch');
const browserSync = require('browser-sync');
const pug = require('gulp-pug');
const sass = require('gulp-sass');
const uglify = require('gulp-uglify');
const revReplace = require("gulp-rev-replace");
const concat = require('gulp-concat');
const override=require('gulp-rev-css-url');
const RevAll = require('gulp-rev-all');
const clean = require('gulp-clean');
const babel = require('gulp-babel');
const rev = require('gulp-rev');
const imagemin = require('gulp-imagemin');
const runSequence = require('run-sequence');
const browserify = require('gulp-browserify');
const webBrowserSync = browserSync.create('WebServer');
const webConfig = {
    port: 3000,
    server: {
        baseDir: "./build"
    }
};

gulp.task('test', function () {
    watch('./js/**', function () {
        console.log(333);
    })
});

gulp.task('clean', function () {
    return gulp.src('./build', {read: false})
        .pipe(clean());
});


gulp.task('watch', function () {
    gulp.watch('./static/pug/**', ['pug']);
    gulp.watch('./static/sass/**', ['sass']);
    gulp.watch('./static/js/**', ['js']);
});
gulp.task('server', function () {
    browserSync.init(webConfig);
});

gulp.task('js', function () {
    return gulp.src('./static/js/main.js')
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(browserify({
            insertGlobals: true,
            debug: !gulp.env.production
        }))
        .pipe(gulp.dest('./build/js'))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('js-build', function () {
    return gulp.src('./static/js/main.js')
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(browserify({
            insertGlobals: true,
            debug: !gulp.env.production
        }))
        .pipe(uglify())
        .pipe(RevAll.revision({
        }))
        .pipe(gulp.dest('./build/js'))
        .pipe(RevAll.manifestFile())
        .pipe(gulp.dest('./build'));
});

gulp.task('sass', function () {
    return gulp.src('./static/sass/main.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./build/css'))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('sass-build', function () {
    return gulp.src('./static/sass/main.scss')
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(RevAll.revision({
        }))
        .pipe(gulp.dest('./build/css'))
        .pipe(RevAll.manifestFile())
        .pipe(gulp.dest('./build'));
});

gulp.task('pug', function () {
    return gulp.src('./static/pug/*.pug')
        .pipe(pug({
            pretty: true
        }))
        .pipe(gulp.dest('./build/'))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('pug-build', function () {
    var manifest = gulp.src('./build/rev-manifest.json');
    return gulp.src('./static/pug/*.pug')
        .pipe(pug({
            pretty: true
        }))
        .pipe(revReplace({
            manifest: manifest
        }))
        .pipe(gulp.dest('./build'))
});

gulp.task('images', function () {
    gulp.src('./static/images/**')
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.jpegtran({progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({plugins: [{removeViewBox: true}]})
        ]))
        .pipe(gulp.dest('./build/images'))
    
});

gulp.task('images-build', function () {
    gulp.src('./static/images/**')
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.jpegtran({progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({plugins: [{removeViewBox: true}]})
        ]))
        .pipe(RevAll.revision({
        }))
        .pipe(gulp.dest('./build/images'))
        .pipe(RevAll.manifestFile())
        .pipe(gulp.dest('./build'));
});

gulp.task('dev', ['clean', 'sass', 'pug', 'server', 'watch']); 
gulp.task('build', function () {
    runSequence('clean', ['js-build', 'sass-build', 'images-build'], 'pug-build');
});