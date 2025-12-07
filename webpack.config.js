const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Disable cache completely
  config.cache = false;

  // Add crypto polyfill for web
  config.resolve.fallback = {
    ...config.resolve.fallback,
    crypto: require.resolve('react-native-get-random-values'),
  };

  return config;
};
