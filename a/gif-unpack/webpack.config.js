const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = (env, argv) => {
  // console.log(env, argv)
  const config = {
    entry  : {
      'animation-packing': path.resolve(__dirname, 'src', 'animation-packing.js')
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
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        title   : 'Gif unpack',
        inject: 'body',
        template: path.resolve(__dirname, 'src', 'index.ejs')
      })
    ]
  }

  if (argv.mode === 'development') {
    config.devtool = 'source-map';
  }

  return config
}
