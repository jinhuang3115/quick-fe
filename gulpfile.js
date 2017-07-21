/**
 * Created by jin.huang on 2017/6/16.
 */
const gulp = require('gulp');
const path = require('path');
const watch = require('gulp-watch'); //监听改变
const browserSync = require('browser-sync'); //启动本地服务器，监听指定目录
const pug = require('gulp-pug');//pug模版编译
const sass = require('gulp-sass');//sass编译
const uglify = require('gulp-uglify');//JS压缩
const revReplace = require("gulp-rev-replace");//替换带指纹文件名
const concat = require('gulp-concat'); //合并文件
const autoprefixer = require('gulp-autoprefixer');//CSS添加前缀
const clean = require('gulp-clean');//清空指定目录或文件
const babel = require('gulp-babel');//babel编译
const rev = require('gulp-rev');//静态文件添加指纹
const imagemin = require('gulp-imagemin');//图片压缩
const runSequence = require('run-sequence');//按顺序执行任务
const browserify = require('gulp-browserify');//JS模块管理
const webBrowserSync = browserSync.create('WebServer');
const webConfig = {
    port: 3000,
    server: {
        baseDir: "./build"
    }
};

//清空build目录
gulp.task('clean', function () {
    return gulp.src('./build', {read: false})
        .pipe(clean());
});

//监听HTML，Sass，Js文件改变
gulp.task('watch', function () {
    gulp.watch('./static/pug/**', ['pug']);
    gulp.watch('./static/sass/**', ['sass']);
    gulp.watch('./static/js/**', ['js']);
});

//启动本地服务
gulp.task('server', function () {
    browserSync.init(webConfig);
});

//开发环境JS处理
gulp.task('js', function () {
    return gulp.src('./static/js/*.js')
        .pipe(browserify({
            insertGlobals: true,
            debug: !gulp.env.production
        }))
        .pipe(gulp.dest('./build/js'))
        .pipe(browserSync.reload({stream: true})); //启动本地服务
});

//生产环境JS处理
gulp.task('js-build', function () {
    var manifest = gulp.src('./rev-manifest.json');
    return gulp.src('./static/js/main.js')
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(browserify({
            insertGlobals: true,
            debug: !gulp.env.production
        })) 
        .pipe(uglify()) //压缩JS文件
        .pipe(revReplace({
            manifest: manifest
        })) //替换JS中带有指纹的静态文件目录
        .pipe(rev())//js文件添加指纹
        .pipe(gulp.dest('./build/js'))
        .pipe(rev.manifest({  //生成指纹文件的manifest文件（map）
            base: './build',
            merge: true
        }))
        .pipe(gulp.dest('./build'))
});

//开发环境Sass处理
gulp.task('sass', function () {
    return gulp.src('./static/sass/main.scss')
        .pipe(sass().on('error', sass.logError)) //编译sass
        .pipe(autoprefixer({ //自动添加前缀
            remove:true
        }))
        .pipe(gulp.dest('./build/css'))
        .pipe(browserSync.reload({stream: true}));
});

//生产环境sass处理
gulp.task('sass-build', function () {
    var manifest = gulp.src('./rev-manifest.json');
    return gulp.src('./static/sass/main.scss')
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(autoprefixer({
            remove:true
        }))
        .pipe(revReplace({
            manifest: manifest
        }))
        .pipe(rev())
        .pipe(gulp.dest('./build/css'))
        .pipe(rev.manifest({
            base: './build',
            merge: true
        }))
        .pipe(gulp.dest('./build'))
});

//开发环境pug文件处理
gulp.task('pug', function () {
    return gulp.src('./static/pug/*.pug')
        .pipe(pug({
            pretty: true
        }))
        .pipe(gulp.dest('./build/'))
        .pipe(browserSync.reload({stream: true}));
});

//生产环境pug文件处理
gulp.task('pug-build', function () {
    var manifest = gulp.src('./rev-manifest.json');
    return gulp.src('./static/pug/*.pug')
        .pipe(pug({
            pretty: true
        }))
        .pipe(revReplace({
            manifest: manifest
        }))
        .pipe(gulp.dest('./build'))
});

//开发环境图片处理
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

//生产环境图片处理
gulp.task('images-build', function () {
    gulp.src('./static/images/**')
        .pipe(imagemin([  //图片压缩
            imagemin.gifsicle({interlaced: true}),
            imagemin.jpegtran({progressive: true}), 
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({plugins: [{removeViewBox: true}]})
        ]))
        .pipe(rev())
        .pipe(gulp.dest('./build/images'))
        .pipe(rev.manifest({
            base: './build',
            merge: true
        }))
        .pipe(gulp.dest('./build'));
});

//开发环境开发执行命令
gulp.task('dev', ['sass', 'pug', 'js', 'server', 'watch']); 

//生产环境执行命令
gulp.task('build', function () {
    runSequence('clean', 'images-build', 'js-build', 'sass-build', 'pug-build');
});