//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next');

const REWRITES = [
  {
    source: '/grpn/healthcheck',
    destination: '/api/grpn/healthcheck',
  },
  {
    source: '/grpn/versions',
    destination: '/api/grpn/versions',
  },
];

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  transpilePackages: ['@ant-design/icons'],
  experimental: {
    instrumentationHook: false,
  },
  nx: {
    svgr: false,
  },
  async rewrites() {
    return REWRITES;
  },
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
