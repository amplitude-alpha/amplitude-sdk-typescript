import { hub } from './hub'

describe('@amplitude-alpha/hub', () => {
  test('should have analytics channel', () => {
    expect(hub.analytics).not.toBe(null);
  });
});
