module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        "babel-preset-expo",
        {
          jsxImportSource: "nativewind",
          lazyImports: true,
          native: {
            useTransformReactJSXExperimental: true,
          },
        },
      ],
    ],
    plugins: [
      "nativewind/babel",
      // WatermelonDB decorator support (legacy mode for compatibility)
      ["@babel/plugin-proposal-decorators", { version: "legacy" }],
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
