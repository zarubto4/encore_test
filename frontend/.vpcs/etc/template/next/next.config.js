//@ts-check
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next');
const VPCSConfig = require('./vpcs.config.json');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/

const nextConfig = {
  publicRuntimeConfig: { vpcs: VPCSConfig.public },
  serverRuntimeConfig: { vpcs: VPCSConfig.server },
  nx: { svgr: false },
};

const plugins = [withNx];

module.exports = composePlugins(...plugins)(nextConfig);
