const { addBeforeLoader, loaderByName } = require('@craco/craco');
const webpack = require('webpack');

module.exports = {
  style: {
    postcss: {
      plugins: [
        require('tailwindcss'),
      ],
    },
  },
  webpack: {
    // though we don't use @ledgerhq, it is a dependency of a dependency, and has
    // caused problems. Seems to require React scripts 5.
    // see: https://github.com/solana-labs/wallet-adapter/issues/499
    plugins: {add: [
      new webpack.NormalModuleReplacementPlugin(
        /@ledgerhq\/devices\/hid-framing/,
        '@ledgerhq/devices/lib/hid-framing'
      )
    ]},
    configure: (webpackConfig) => {
      webpackConfig.module.rules.push(
        {
          test:/\.(js|ts)$/,
          loader: require.resolve('@open-wc/webpack-import-meta-loader'),
        }
      )

      const wasmExtensionRegExp = /\.wasm$/;
      webpackConfig.resolve.extensions.push('.wasm');

      webpackConfig.module.rules.forEach((rule) => {
        (rule.oneOf || []).forEach((oneOf) => {
          if (oneOf.loader && oneOf.loader.indexOf('file-loader') >= 0) {
            oneOf.exclude.push(wasmExtensionRegExp);
          }
        });
      });

      const wasmLoader = {
        test: /\.wasm$/,
        exclude: /node_modules/,
        loaders: ['wasm-loader'],
      };

      addBeforeLoader(webpackConfig, loaderByName('file-loader'), wasmLoader);

      return webpackConfig;
    },
  },
}


