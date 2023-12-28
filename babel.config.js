/* eslint-env node */
module.exports = function (api) {
  api.cache(true);
  const moduleResolverConfig =
    api.plugins?.find((plugin) => plugin[0] === 'module-resolver')?.[1] || {};
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ...(api.plugins || []),
      [
        'module-resolver',
        {
          ...moduleResolverConfig,
          root: ['.'],
          alias: {
            ...moduleResolverConfig.alias,
            '.': './src',
          },
        },
      ],
    ],
  };
};
