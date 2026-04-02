const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Mock react-native-reanimated in Expo Go for UI testing
config.resolver = {
  ...config.resolver,
  resolveRequest: (context, moduleName, platform) => {
    // Check if running in Expo Go (no native modules available)
    const isExpoGo = process.env.EXPO_PUBLIC_EXPO_GO === 'true' || !process.env.EAS_BUILD;
    
    if (isExpoGo && moduleName === 'react-native-reanimated') {
      return {
        filePath: path.resolve(__dirname, 'src/mocks/reanimated.ts'),
        type: 'sourceFile',
      };
    }
    
    // Block WatermelonDB imports completely for UI testing
    if (moduleName.includes('@nozbe/watermelondb')) {
      return {
        filePath: path.resolve(__dirname, 'src/mocks/nativeModules.ts'),
        type: 'sourceFile',
      };
    }
    
    // Default resolver
    return context.resolveRequest(context, moduleName, platform);
  },
};

// Transform packages that use import.meta or ESM syntax
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

module.exports = withNativeWind(config, { input: "./global.css" });
