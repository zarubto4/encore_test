import { jest } from 'jest-mock';

const mockConfig = {
  publicRuntimeConfig: {
    vpcs: {
      _globals: {
        environment: 'production',
        host: 'https://localhost',
      },
      'umapi-client': {
        'client-id': '1234',
      },
      fakemodule: {
        public: true,
      },
    },
  },
  serverRuntimeConfig: {
    vpcs: {
      fakemodule: {
        loaded: true,
      },
    },
  },
};

let fakePublicConfig = {};
let fakeServerConfig = {};
const setMockFeatureServerConfig = (feature, config = {}) => {
  fakeServerConfig[feature] = config;
};

const setMockFeaturePublicConfig = (feature, config = {}) => {
  fakePublicConfig[feature] = config;
};

const getConfig = () => {
  let public_config = {};
  let server_config = {};
  if (Object.keys(fakePublicConfig).length > 0) public_config.vpcs = fakePublicConfig;
  if (Object.keys(fakeServerConfig).length > 0) server_config.vpcs = fakeServerConfig;
  return {
    publicRuntimeConfig: { ...mockConfig.publicRuntimeConfig, ...public_config },
    serverRuntimeConfig: { ...mockConfig.serverRuntimeConfig, ...server_config },
  };
};

export { getConfig, setMockFeatureServerConfig, setMockFeaturePublicConfig };
export default getConfig;
