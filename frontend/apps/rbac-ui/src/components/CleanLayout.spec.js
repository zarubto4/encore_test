import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CustomLayout from '@/components/CleanLayout'; // Adjust the import path as necessary

describe('CustomLayout component', () => {
  it('renders children correctly', () => {
    render(
      <CustomLayout>
        <div data-testid="child">Child Content</div>
      </CustomLayout>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByTestId('child')).toHaveTextContent('Child Content');
  });

  it('applies correct styles', () => {
    render(
      <CustomLayout>
        <div data-testid="child">Child Content</div>
      </CustomLayout>
    );

    const layout = screen.getByTestId('layout-container');
    expect(layout).toHaveStyle('min-height: 100vh');
    expect(layout).toHaveStyle('display: flex');
    expect(layout).toHaveStyle('flex-direction: column');
  });
});
