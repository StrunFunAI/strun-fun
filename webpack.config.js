const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Disable cache and snapshot to avoid CRC errors
  config.cache = false;
  config.snapshot = { managedPaths: [], buildDependencies: { hash: false, timestamp: false } };
  
  // Add crypto polyfill
  if (!config.resolve) {
    config.resolve = {};
  }
  if (!config.resolve.fallback) {
    config.resolve.fallback = {};
  }
  config.resolve.fallback.crypto = false; // Use empty module to avoid issues
  
  return config;
};
