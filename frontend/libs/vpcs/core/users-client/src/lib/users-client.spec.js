import { usersClient } from './users-client';
describe('usersClient', () => {
  it('should work', () => {
    expect(usersClient()).toEqual('users-client');
  });
});
