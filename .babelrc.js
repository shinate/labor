const presets = [
  '@babel/preset-env'
]

const plugins = [
  [
    '@babel/plugin-proposal-decorators',
    {
      legacy: true
    }
  ],
  [
    '@babel/plugin-proposal-class-properties',
    {
      loose: true
    }
  ],
  [
    '@babel/plugin-transform-async-to-generator',
    {
      module: 'bluebird',
      method: 'coroutine'
    }
  ]
  // [
  //   'module:fast-async',
  //   {
  //     'spec'    : true,
  //     'compiler': { 'promises': true, 'generators': false }
  //   }
  // ]
]

module.exports = {
  presets,
  plugins,
  comments: false
}
