require('dotenv-extended').load();

const path = require('path');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const { PHASE_PRODUCTION_SERVER } = require('next/constants');

module.exports = phase => {
  const common = {
    target: 'serverless',
    serverRuntimeConfig: {
      subgraphHttp: process.env.MELON_SUBGRAPH_HTTP,
      subgraphWs: process.env.MELON_SUBGRAPH_WS,
    },
    publicRuntimeConfig: {
      subgraphHttp: process.env.MELON_SUBGRAPH_HTTP_PUBLIC || process.env.MELON_SUBGRAPH_HTTP,
      subgraphWs: process.env.MELON_SUBGRAPH_WS_PUBLIC || process.env.MELON_SUBGRAPH_WS,
    },
  };

  if (phase === PHASE_PRODUCTION_SERVER) {
    return common;
  }

  const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: !!JSON.parse(process.env.ANALYZE || 'false'),
  });

  return withBundleAnalyzer({
    ...common,
    webpack: (config, options) => {
      config.resolve.alias = Object.assign({}, config.resolve.alias || {}, {
        // Easy root level access to our file hierarcy.
        '~': path.join(options.dir),
      });

      config.plugins = config.plugins.filter(plugin => !(plugin instanceof ForkTsCheckerWebpackPlugin));

      return config;
    },
  });
};
