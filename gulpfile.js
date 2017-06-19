/**
 * Created by jin.huang on 2017/6/16.
 */
const gulp = require('gulp');
const watch = require('gulp-watch');
const browserSync = require('browser-sync').create();
const pug = require('gulp-pug');
const sass = require('gulp-sass');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');


gulp.task('test', function(){
    watch('./js/**', function(){
        console.log(333);
    })
});
gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });
});

gulp.task('sass', function (){
    return gulp.src('./static/sass/main.scss')
        .pipe(sass(/*{outputStyle: 'compressed'}*/).on('error', sass.logError))
        .pipe(gulp.dest('./build/css'))
});

gulp.task('pug', function buildHTML() {
    return gulp.src('./static/pug/*.pug')
        .pipe(pug({
            pretty: true
        }))
        .pipe(gulp.dest('./build/'))
});