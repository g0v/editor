import webpack from "webpack";
import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import ExtractTextPlugin from "extract-text-webpack-plugin";

export default {
  entry: {
    application: "./javascripts/application.js",
  },

  output: {
    path: path.join(__dirname, "docs"),
    filename: "[name].js",
    publicPath: process.env.PUBLIC_PATH || "/editor/",
  },

  resolve: {
    extensions: ["", ".js", ".jsx", ".css"],
    modulesDirectories: ["javascripts", "stylesheets", "images", "node_modules"],
  },

  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel',
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract("style", "css"),
      },
      {
        test: /\.json$/,
        loader: 'json',
      },
      {
        test: /\.(png|jpg)$/,
        loader: "file?name=[name].[ext]",
      },
    ]
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: "templates/index.html",
    }),
    new ExtractTextPlugin("index.css", {
      allChunks: true
    }),
    new ExtractTextPlugin("reset.css", {
      allChunks: true,
    }),
    new ExtractTextPlugin("search.css", {
      allChunks: true,
    }),
  ],
};
