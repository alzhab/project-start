// webpack.config.js

module.exports = {
  output: {
    filename: 'main.js',
  },
  module: {
    rules: [{
      test: /\.(js|jsx)$/,
      exclude: /(node_modules)/,
      loader: 'babel-loader',
      query: {
        presets: [
          ['latest', {
            modules: false
          }],
        ],
      },
    }, ],
  },
};