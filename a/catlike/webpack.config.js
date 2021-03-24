const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = (env, argv) => {
  // console.log(env, argv)

  const config = {
    entry  : {
      'main': path.resolve(__dirname, 'src', 'main.js')
    },
    output : {
      filename: `[name]${argv.mode === 'development' ? '.dev' : ''}.js`,
      path    : path.resolve(__dirname)
    },
    module : {
      rules: [
        {
          test   : /\.js$/,
          loader : 'babel-loader',
          options: {
            presets: [ '@babel/preset-env' ],
            plugins: [
              '@babel/plugin-proposal-class-properties'
            ]
          }
        },
        {
          test: /\.less$/i,
          use : [ MiniCssExtractPlugin.loader, 'css-loader', 'less-loader' ]
        }
      ]
    },
    plugins: [
      new MiniCssExtractPlugin({
        linkType: 'text/css',
        filename: `[name]${argv.mode === 'development' ? '.dev' : ''}.css`
      }),
      new HtmlWebpackPlugin({
        title   : 'CATLIKE',
        inject  : 'body',
        template: path.resolve(__dirname, 'src', 'index.ejs')
      })
    ]
  }

  if (argv.mode === 'development') {
    config.devtool = 'source-map'
  }

  return config
}
