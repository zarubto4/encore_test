import { VPCSNextJS } from './vpcs-nextjs';

describe('VPCSNextJS', () => {
  it('should return a VPCSNextJS object', () => {
    const vpcs = new VPCSNextJS('umapi-client');
    expect(vpcs).toBeInstanceOf(VPCSNextJS);
    expect(vpcs.globals.host).toBe('https://localhost');
    expect(vpcs.globals.environment).toBe('production');
  });

  it('should have feature config in publicRuntimeConfig', () => {
    const vpcs = new VPCSNextJS('umapi-client');
    console.log(vpcs.config);
    expect(vpcs.config['client-id']).toBe('1234');
  });

  it('should have feature config in serverRuntimeConfig', () => {
    const vpcs = new VPCSNextJS('fakemodule');
    expect(vpcs.config.public).toBe(true);
    expect(vpcs.config.loaded).toBe(true);
  });
});
