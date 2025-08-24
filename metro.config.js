/* eslint-env node */
// Learn more https://docs.expo.io/guides/customizing-metro
// eslint-disable-next-line @typescript-eslint/no-var-requires, import/extensions
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

module.exports = {
  ...config,
  resolver: {
    // Attempt to load icons for web
    // https://github.com/expo/expo/issues/21568#issuecomment-1456968737
    assetExts: [...(config.resolver?.assetExts || []), 'ttf', 'otf'],
    // https://github.com/facebook/react-native/issues/33466
    // https://stackoverflow.com/questions/70071602/main-module-field-cannot-be-resolved-after-installing-apollo-client/70076278#70076278
    sourceExts: [...(config.resolver?.sourceExts || []), 'cjs'],
  },
};
