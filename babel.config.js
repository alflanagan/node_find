module.exports = function (api) {
  api.cache(true)

  console.log('babel processing babel.config.js')
  const presets = [ '@babel/env' ]
  const plugins = [ ]

  return {
    presets,
    plugins
  }
}
