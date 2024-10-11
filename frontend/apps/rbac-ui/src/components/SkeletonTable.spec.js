import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SkeletonTable from '@/components/SkeletonTable';
import { matchMedia } from '@/specs/matchMedia.spec';

beforeAll(matchMedia);

describe('SkeletonTable component', () => {
  const columns = [
    {
      key: 'column1',
      title: 'Column 1',
      dataIndex: 'column1',
    },
    {
      key: 'column2',
      title: 'Column 2',
      dataIndex: 'column2',
    },
  ];

  it('renders the skeleton table when loading', () => {
    render(<SkeletonTable loading={true} columns={columns} />);
    
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(6); // 1 header row + 5 data rows
    expect(screen.getAllByRole('cell')).toHaveLength(10); // 2 columns * 5 rows
  });

  it('renders the specified number of skeleton rows when loading', () => {
    render(<SkeletonTable loading={true} columns={columns} rowCount={3} />);
    
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(4); // 1 header row + 3 data rows
    expect(screen.getAllByRole('cell')).toHaveLength(6); // 2 columns * 3 rows
  });

  it('renders children when not loading', () => {
    render(
      <SkeletonTable loading={false} columns={columns}>
        <div data-testid="children-content">Loaded content</div>
      </SkeletonTable>
    );

    expect(screen.getByTestId('children-content')).toBeInTheDocument();
    expect(screen.getByText('Loaded content')).toBeInTheDocument();
  });
});
