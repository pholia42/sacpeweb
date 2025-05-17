const { defineConfig } = require('@vue/cli-service')
const webpack = require('webpack')

module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  devServer: {
    host: 'localhost', // 建议明确指定 host
    port: 8080,      // 前端开发服务器端口 (如果需要指定)
    proxy: {
      '/api': { // 所有以 /api 开头的请求都会被代理
        target: 'http://localhost:8081', // 指向您的 Spring Boot 后端
        changeOrigin: true
        // pathRewrite 已移除，因为后端 context-path 也是 /api
      }
    }
  },
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false),
      }),
    ],
  },
})