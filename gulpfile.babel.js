'use strict';

import path from "path";
import gulp from "gulp";
import clean from "gulp-clean";
import gutil from "gulp-util";
import ghpages from "gh-pages";
import webpack from "webpack";

const env = process.env.NODE_ENV || "development";

gulp.task("default", ["webpack"]);

gulp.task("clean", () => {
  gulp.src("dist", { read: false }).pipe(clean());
});

gulp.task("webpack", ["clean"], (callback) => {
  let config = require("./webpack.config.babel.js").default;
  webpack(config, (error, stats) => {
    if (error) {
      console.log("error in webpack");
    }
    callback();
  });
});

gulp.task("deploy", ["clean", "webpack"], () => {
  ghpages.publish(path.join(__dirname, "dist"), (error) => {
    console.log(error);
  });
});
