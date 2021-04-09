module.exports = function (api) {
  api.cache(true)

  return {
    presets: ['@babel/preset-env'],
    plugins: [
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      ['@babel/plugin-proposal-class-properties', { loose: true }],
      '@babel/plugin-proposal-class-static-block',
      '@babel/plugin-proposal-export-default-from',
    ],
  }
}
