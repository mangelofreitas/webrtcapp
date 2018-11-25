"use strict";

var gulp = require("gulp"),
    series = require('stream-series'),
    angularFilesort = require('gulp-angular-filesort'),
    inject = require('gulp-inject'),
    sass = require('gulp-sass');


gulp.task('index', function () {

    var target = gulp.src('./WebRTCApp/index.html');

    var jsVendors = gulp.src([
        './WebRTCApp/libs/jquery.min.js',
        './WebRTCApp/dependencies/angularjs/angular.min.js',
        './WebRTCApp/dependencies/**/*.js',
        './WebRTCApp/libs/**/*.js',
    ], { read: false });

    var jsSources = gulp.src([
        './WebRTCApp/app-config/**/*.js',
        './WebRTCApp/controllers/**/*.js',
        './WebRTCApp/directives/**/*.js',
        './WebRTCApp/filters/**/*.js',
        './WebRTCApp/services/**/*.js'
    ]).pipe(angularFilesort());

    var cssVendors = gulp.src([
        './WebRTCApp/content/css/**/*.css',
        '!./WebRTCApp/content/css/site.css'
    ], { read: false });

    var cssSources = gulp.src('./WebRTCApp/content/css/site.css', { read: false });

    return target.pipe(inject(series(jsVendors, jsSources, cssVendors, cssSources), { relative: true }))
        .pipe(gulp.dest('./WebRTCApp/'));
});

gulp.task('sass', function(){
    return gulp.src([
        'WebRTCApp/content/css/*.scss'
    ])
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(function(file){
        var split = file.path.split("\\");
        var fileFolder = split.slice(0, split.length - 1).join("\\");
        return fileFolder;
    }));
});

gulp.task('sass:watch', function(){
    gulp.watch(['WebRTCApp/content/css/*.scss'], ['sass']);
});