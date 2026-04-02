module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // WatermelonDB decorator support (legacy mode for compatibility)
      ["@babel/plugin-proposal-decorators", { legacy: true }],
      // React Native Reanimated must be last
      "react-native-reanimated/plugin",
    ],
    env: {
      production: {
        plugins: ["transform-remove-console"],
      },
    },
  };
};
