// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // ← NO debe haber plugins: ['react-native-reanimated/plugin'] aquí
  };
};