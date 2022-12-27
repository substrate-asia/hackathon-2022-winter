const { defineConfig } = require('@vue/cli-service')
const AutoImport = require('unplugin-auto-import/webpack')
const Components = require('unplugin-vue-components/webpack')
const { ElementPlusResolver } = require('unplugin-vue-components/resolvers')
const { VantResolver } = require('unplugin-vue-components/resolvers');
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  pluginOptions: {
    windicss: {}
  },
  configureWebpack: {
    plugins: [
      AutoImport({
        resolvers: [],
      }),
      Components({
        resolvers: [VantResolver(), ElementPlusResolver()],
      }),
      new NodePolyfillPlugin()
    ],
    optimization: {
      splitChunks: {
        chunks: "all",
      },
    },
    performance: {
      hints: 'warning',
      maxEntrypointSize: 50000000,
      maxAssetSize: 30000000,
      assetFilter: function (assetFilename) {
        return assetFilename.endsWith('.js')
      }
    },
  },
  devServer: {
    proxy: {
      '/twitter': {
        target: 'https://api.twitter.com',
        changeOrigin: true,
        pathRewrite: {
          '^/twitter': ''
        }
      },
      '/api': {
        target: 'https://www.baidu.com',
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      },
      '/steem': {
        target: 'https://steem.wh3.io',
        changeOrigin: true,
        pathRewrite: {
          '^/steem': ''
        }
      }
    }
  },
  productionSourceMap: false
})
