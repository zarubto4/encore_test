import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResponsiveTableRow from '@/components/ResponsiveTableRow';

describe('ResponsiveTableRow component', () => {
  it('renders children correctly', () => {
    render(
      <ResponsiveTableRow>
        <ResponsiveTableRow.Title>Title</ResponsiveTableRow.Title>
        <ResponsiveTableRow.Value>Value</ResponsiveTableRow.Value>
      </ResponsiveTableRow>
    );

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Value')).toBeInTheDocument();
  });

  it('applies correct classes to the title and value', () => {
    render(
      <ResponsiveTableRow>
        <ResponsiveTableRow.Title>Title</ResponsiveTableRow.Title>
        <ResponsiveTableRow.Value>Value</ResponsiveTableRow.Value>
      </ResponsiveTableRow>
    );

    const titleElement = screen.getByText('Title');
    const valueElement = screen.getByText('Value');

    expect(titleElement).toHaveClass('w-1/2 font-bold');
    expect(valueElement).toHaveClass('w-1/2');
  });

  it('renders multiple rows correctly', () => {
    render(
      <>
        <ResponsiveTableRow>
          <ResponsiveTableRow.Title>Title 1</ResponsiveTableRow.Title>
          <ResponsiveTableRow.Value>Value 1</ResponsiveTableRow.Value>
        </ResponsiveTableRow>
        <ResponsiveTableRow>
          <ResponsiveTableRow.Title>Title 2</ResponsiveTableRow.Title>
          <ResponsiveTableRow.Value>Value 2</ResponsiveTableRow.Value>
        </ResponsiveTableRow>
      </>
    );

    expect(screen.getByText('Title 1')).toBeInTheDocument();
    expect(screen.getByText('Value 1')).toBeInTheDocument();
    expect(screen.getByText('Title 2')).toBeInTheDocument();
    expect(screen.getByText('Value 2')).toBeInTheDocument();
  });
});
