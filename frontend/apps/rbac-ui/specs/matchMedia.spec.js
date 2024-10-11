export const matchMedia = () => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => {
      const matches = query === '(min-width: 768px)';
      return {
        matches,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      };
    }),
  });
};

describe('mediaQuery', () => {
  it('should match media query', () => {
    matchMedia();
    expect(window.matchMedia('(min-width: 768px)').matches).toBe(true);
  });
});
