import { grpnRequestMiddleware } from './grpn-request-middleware';
describe('grpnRequestMiddleware', () => {
  it('should work', () => {
    expect(grpnRequestMiddleware()).toEqual('grpn-request-middleware');
  });
});
