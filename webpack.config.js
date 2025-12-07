const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: {
        dangerouslyAddModulePathsToTranspile: ['@solana/web3.js'],
      },
    },
    argv
  );

  // Disable cache to prevent CRC errors
  config.cache = false;

  // Crypto polyfill for web
  config.resolve.fallback = {
    ...config.resolve.fallback,
    crypto: require.resolve('react-native-get-random-values'),
  };

  // Mock expo-font on web to prevent registerWebModule errors
  config.resolve.alias = {
    ...config.resolve.alias,
    'expo-font': path.resolve(__dirname, 'src/mocks/expo-font.js'),
  };

  return config;
};
