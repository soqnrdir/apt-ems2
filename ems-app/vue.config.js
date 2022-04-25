module.exports = {
  lintOnSave: false,
  devServer: {
    port: 3013,
    host: '0.0.0.0',
    proxy: 'http://localhost:3012'
  }
}
