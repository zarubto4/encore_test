import { rbacClient } from './rbac-client';
describe('rbacClient', () => {
  it('should work', () => {
    expect(rbacClient()).toEqual('rbac-client');
  });
});
