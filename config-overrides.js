const webpack = require('webpack');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = function override(config) {
  // Add Node.js polyfills for browser compatibility
  config.resolve.fallback = {
    ...config.resolve.fallback,
    buffer: require.resolve('buffer/'),
    stream: require.resolve('stream-browserify'),
    crypto: require.resolve('crypto-browserify'),
    https: require.resolve('https-browserify'),
    http: require.resolve('stream-http'),
    zlib: require.resolve('browserify-zlib'),
    url: require.resolve('url/'),
    path: require.resolve('path-browserify'),
    vm: require.resolve('vm-browserify'),
  };

  // Add polyfill plugins
  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    }),
    new NodePolyfillPlugin(), // Add NodePolyfillPlugin
  ];

  // Disable the source-map-loader entirely for certain modules
  const sourceMapRule = config.module.rules.find(
    (rule) =>
      rule.enforce === 'pre' &&
      rule.use &&
      rule.use.some((u) => typeof u === 'string' && u.includes('source-map-loader'))
  );

  if (sourceMapRule) {
    sourceMapRule.exclude = [
      ...(sourceMapRule.exclude || []),
      /node_modules\/@metamask\/utils\/node_modules\/superstruct/,
      /node_modules\/@fractalwagmi\/solana-wallet-adapter/,
      /node_modules\/@trezor\/schema-utils/,
      /node_modules\/@trezor\/transport/,
      /node_modules\/@trezor\/utils/,
    ];

    // Optional: Disable source-map-loader entirely (if exclusion doesn't work)
    config.module.rules = config.module.rules.filter((rule) => {
      return !(rule.use && rule.use.some((u) => u.loader === 'source-map-loader'));
    });
  }

  // Disable source maps entirely
  config.devtool = false;

  return config;
};
