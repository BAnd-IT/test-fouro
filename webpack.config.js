const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const devServer = (isDev) =>
  !isDev
    ? {}
    : {
        devServer: {
          open: true,
          hot: true,
          port: 8080,
        },
      };

module.exports = ({ develop }) => ({
  mode: develop ? "development" : "production",
  entry: {
    main: "./src/index.js",
    first: "./src/js/first-case.js",
    second: "./src/js/second-case.js",
    third: "./src/js/third-case.js",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].bundle.js",
    assetModuleFilename: "assets/[hash][ext][query]",
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
      {
        test: /\.(?:ico|png|jpg|jpeg|svg)$/i,
        type: "asset/resource",
      },
      {
        test: /\.(woff(2)?|eot|ttf|otf|svg|)$/,
        type: "asset/inline",
      },
      {
        test: /\.html$/i,
        loader: "html-loader",
      },
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.scss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          "postcss-loader",
          "sass-loader",
        ],
      },
    ],
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: "jquery",
      jquery: "jquery",
      "window.jQuery": "jquery",
      jQuery: "jquery",
    }),
    new HtmlWebpackPlugin({
      hash: true,
      title: "Fouro test",
      myPageHeader: "Fouro test",
      template: "./src/index.html",
      chunks: ["main"],
      filename: "index.html",
    }),
    new HtmlWebpackPlugin({
      hash: true,
      title: "First case",
      myPageHeader: "First case",
      template: "./src/pages/first.html",
      chunks: ["main", "first"],
      filename: "first.html",
    }),
    new HtmlWebpackPlugin({
      hash: true,
      title: "Second case",
      myPageHeader: "Second case",
      template: "./src/pages/second.html",
      chunks: ["second"],
      filename: "second.html",
    }),
    new HtmlWebpackPlugin({
      hash: true,
      title: "Third case",
      myPageHeader: "Third case",
      template: "./src/pages/third.html",
      chunks: ["third"],
      filename: "third.html",
    }),

    new MiniCssExtractPlugin({
      filename: "./styles/[name].css",
    }),
  ],
  ...devServer(develop),
});
