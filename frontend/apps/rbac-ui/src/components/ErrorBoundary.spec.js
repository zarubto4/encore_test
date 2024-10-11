import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ErrorBoundary from '@/components/ErrorBoundary';

// Mock the logger and handleError functions
jest.mock('@/lib/Logger/client', () => jest.fn().mockImplementation(() => ({
  crit: jest.fn().mockReturnThis(),
  write: jest.fn(),
})));

jest.mock('@/utils', () => ({
  handleError: jest.fn(),
}));

// A component that throws an error
const ProblematicComponent = () => {
  throw new Error('Test error');
};

describe('ErrorBoundary component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div data-testid="child">Child Content</div>
      </ErrorBoundary>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('displays error message when a child throws an error', () => {
    render(
      <ErrorBoundary>
        <ProblematicComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
  });
});
