// Basic test to verify Jest setup

describe('Basic Test Setup', () => {
  it('should pass a basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should have Jest working', () => {
    expect(typeof jest).toBe('object');
  });
});
