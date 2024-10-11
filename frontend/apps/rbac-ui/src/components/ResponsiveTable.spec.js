import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResponsiveTable from '@/components/ResponsiveTable';
import useIsLargeScreen from '@/hooks/useIsLargeScreen';
import { Table } from 'antd';
import { matchMedia } from '@/specs/matchMedia.spec';

beforeAll(matchMedia);

// Mock the useIsLargeScreen hook
jest.mock('@/hooks/useIsLargeScreen');

// Mock data and columns
const mockColumns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
  },
];
const mockData = [
  {
    key: '1',
    name: 'John Brown',
    age: 32,
  },
  {
    key: '2',
    name: 'Jim Green',
    age: 42,
  },
];

describe('ResponsiveTable component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the table with large screen configuration', () => {
    useIsLargeScreen.mockReturnValue(true);

    render(<ResponsiveTable columns={mockColumns} dataSource={mockData} loading={false} />);

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
    expect(screen.getByText('John Brown')).toBeInTheDocument();
    expect(screen.getByText('32')).toBeInTheDocument();
  });

  it('renders the table with small screen configuration', () => {
    useIsLargeScreen.mockReturnValue(false);

    render(<ResponsiveTable columns={mockColumns} dataSource={mockData} loading={false} />);

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.queryAllByText('Name')).toHaveLength(2);
    expect(screen.queryAllByText('Age')).toHaveLength(2);
    expect(screen.getByText('John Brown')).toBeInTheDocument();
    expect(screen.getByText('32')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    useIsLargeScreen.mockReturnValue(true);

    render(<ResponsiveTable columns={mockColumns} dataSource={[]} loading={true} />);

    const loadingElement = document.querySelector('.ant-spin-nested-loading');
    expect(loadingElement).toBeInTheDocument();
  });

  it('renders empty state', () => {
    useIsLargeScreen.mockReturnValue(true);

    render(<ResponsiveTable columns={mockColumns} dataSource={[]} loading={false} />);

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('No data')).toBeInTheDocument();
  });
});
