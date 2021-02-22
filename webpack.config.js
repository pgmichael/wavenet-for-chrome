const path = require('path')
const copyPlugin = require("copy-webpack-plugin")

const popupCfg = {
  entry: [
    './src/popup/popup.ts',
    './src/popup/popup.scss'
  ],
  output: {
    filename: 'popup.js',
    path: path.resolve(__dirname, 'dist', 'popup'),
  },
  mode: 'none',
  resolve: { extensions: ['.js', '.ts', '.scss'] },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: "ts-loader" },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'file-loader',
            options: { outputPath: '', name: '[name].css' }
          },
          'sass-loader'
        ]
      }
    ]
  },
  plugins: [new copyPlugin({
    patterns: [
      {
        from: "./src/popup/popup.html",
        to: `${path.resolve(__dirname, 'dist', 'popup')}/popup.html`
      },
      {
        from: "./src/manifest.json",
        to: `${path.resolve(__dirname, 'dist')}/manifest.json`
      },
      {
        from: "./src/assets",
        to: path.resolve(__dirname, 'dist', 'assets')
      }
    ]
  })],
  devtool: "source-map",
  experiments: { topLevelAwait: true },
}

const backgroundCfg = {
  entry: "./src/background.ts",
  output: {
    filename: "background.js",
    path: path.resolve(__dirname, 'dist'),
  },
  mode: 'none',
  resolve: { extensions: ['.js', '.ts'] },
  module: {
    rules: [{ test: /\.tsx?$/, loader: "ts-loader" }]
  },
  devtool: "source-map",
  experiments: { topLevelAwait: true },
}

module.exports = [popupCfg, backgroundCfg]