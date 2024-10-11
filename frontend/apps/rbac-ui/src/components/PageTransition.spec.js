import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PageTransition from '@/components/PageTransition';

describe('PageTransition component', () => {
  it('renders children correctly', () => {
    const childText = 'This is a child component';
    render(
      <PageTransition>
        <div>{childText}</div>
      </PageTransition>
    );

    expect(screen.getByText(childText)).toBeInTheDocument();
  });

  it('applies the correct transition prop', () => {
    const { container } = render(
      <PageTransition>
        <div>Test</div>
      </PageTransition>
    );

    const motionDiv = container.firstChild;

    // Ensure the transition prop is applied correctly
    expect(motionDiv).toHaveAttribute('style', expect.stringContaining('transform'));
  });
});
