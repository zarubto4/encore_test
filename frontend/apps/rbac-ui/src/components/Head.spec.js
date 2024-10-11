import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import HeadComponent from '@/components/Head';

jest.mock('next/head', () => {
  return {
    __esModule: true,
    default: ({ children }) => {
      return <>{children}</>;
    },
  };
});

describe('HeadComponent', () => {
  it('sets the page title correctly', () => {
    const testTitle = 'Test Page';
    const { container } = render(<HeadComponent title={testTitle} />);

    expect(container.innerHTML).toContain(`<title>${testTitle} | RBAC UI</title>`);
  });
});
