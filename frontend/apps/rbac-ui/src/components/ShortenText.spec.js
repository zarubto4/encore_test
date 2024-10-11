import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ShortenText } from '@/components/ShortenText';

describe('ShortenText component', () => {
  it('renders the full text when text length is less than maxLength', () => {
    render(<ShortenText text="Short text" maxLength={20} />);
    
    expect(screen.getByText('Short text')).toBeInTheDocument();
  });

  it('renders the shortened text with a tooltip when text length exceeds maxLength', async () => {
    render(<ShortenText text="This is a very long text that needs to be shortened" maxLength={25} />);
    
    const shortenedText = screen.getByText('This is a very long text...');
    expect(shortenedText).toBeInTheDocument();

    fireEvent.mouseOver(shortenedText);
    
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toHaveTextContent('This is a very long text that needs to be shortened');
    });
  });

  it('renders the shortened text with a default maxLength of 20', async () => {
    render(<ShortenText text="This is another long text that needs to be shortened" />);
    
    const shortenedText = screen.getByText('This is another long...');
    expect(shortenedText).toBeInTheDocument();

    fireEvent.mouseOver(shortenedText);

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toHaveTextContent('This is another long text that needs to be shortened');
    });
  });

  it('does not render a tooltip if text is not shortened', () => {
    render(<ShortenText text="Short text" maxLength={20} />);
    
    expect(screen.getByText('Short text')).toBeInTheDocument();
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });
});
