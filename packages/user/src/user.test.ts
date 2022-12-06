import { user } from './user'

describe('@amplitude-alpha/user', () => {
  test('should export a default user', () => {
    expect(user).not.toBe(null);
  });
});
