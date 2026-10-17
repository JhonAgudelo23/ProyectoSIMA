const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  devServer: {
    // Redirige /api al backend (node server/index.js)
    proxy: { '/api': { target: 'http://localhost:3000' } }
  },
  pages: {
    index: {
      entry: 'src/main.js'
    }
  }
})