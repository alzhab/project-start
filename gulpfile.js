"use strict";

const gulp = require("gulp"),
  sass = require("gulp-sass"),
  sourcemaps = require("gulp-sourcemaps"),
  gulpIf = require("gulp-if"),
  del = require("del"),
  newer = require("gulp-newer"),
  browserSync = require("browser-sync").create(),
  imagemin = require("gulp-imagemin"),
  cleanCSS = require("gulp-clean-css"),
  autoprefixer = require("gulp-autoprefixer"),
  webpack = require("webpack"),
  webpackStream = require("webpack-stream"),
  webpackConfig = require("./webpack.config.js"),
  pug = require("gulp-pug"),
  flatten = require("gulp-flatten")

const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV == "development";

gulp.task("js", () => {
  return gulp
    .src("dev/app/main.js")
    .pipe(
      webpackStream(webpackConfig),
      webpack
    )
    .on("error", function handleError() {
      this.emit("end"); // Recover from errors
    })
    .pipe(gulp.dest("public"));
});

gulp.task("sass", function () {
  return gulp
    .src("dev/app/main.scss")
    .pipe(gulpIf(isDevelopment, sourcemaps.init()))
    .pipe(sass())
    .pipe(
      autoprefixer(["last 15 versions", "> 1%", "ie 8", "ie 7"], {
        cascade: true
      })
    )
    .pipe(
      cleanCSS({
        compatibility: "ie8"
      })
    )
    .pipe(gulpIf(isDevelopment, sourcemaps.write()))
    .pipe(gulp.dest("public"));
});

gulp.task("clean", function () {
  return del("public");
});

gulp.task("html", function buildHTML() {
  return gulp
    .src("dev/app/*.pug")
    .pipe(
      pug({
        doctype: "html",
        pretty: false
      })
    )
    .pipe(gulp.dest("public/"));
});

gulp.task("images", function () {
  return gulp
    .src("dev/**/*.{png, jpeg, gif}")
    .pipe(newer("public")) //2
    .pipe(
      imagemin([
        imagemin.gifsicle({
          interlaced: true
        }),
        imagemin.jpegtran({
          progressive: true
        }),
        imagemin.optipng({
          optimizationLevel: 5
        }),
        imagemin.svgo({
          plugins: [{
              removeViewBox: true
            },
            {
              cleanupIDs: false
            }
          ]
        })
      ])
    )
    .pipe(flatten())
    .pipe(gulp.dest("public/img"));
});

gulp.task("fonts", function () {
  return gulp.src('./dev/fonts/**/*.*')
    .pipe(gulp.dest('public/fonts'))
})

gulp.task("build", gulp.series("clean", gulp.parallel("html", "sass", "js", "images", "fonts")));

gulp.task("watch", function () {
  gulp.watch("dev/**/**.scss", gulp.series("sass"));
  gulp.watch("dev/**/**.js", gulp.series("js"));
  gulp.watch("dev/**/**.pug", gulp.series("html"));
  gulp.watch("dev/**/img/*.{png, jpeg, gif}", gulp.series("images"));
  gulp.watch("dev/fonts/**/*.*", gulp.series("fonts"));
});

gulp.task("serve", function () {
  browserSync.init({
    server: "public"
  });

  browserSync.watch("public/**/*.*").on("change", browserSync.reload);
});

gulp.task("start", gulp.series("build", gulp.parallel("watch", "serve")));