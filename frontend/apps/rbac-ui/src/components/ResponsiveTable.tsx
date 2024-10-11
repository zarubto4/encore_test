import { ReactNode } from 'react';
import { Table } from 'antd';

import useIsLargeScreen from '@/hooks/useIsLargeScreen';
import ResponsiveTableRow from '@/components/ResponsiveTableRow';
import SkeletonTable, { type SkeletonTableColumnsType } from '@/components/SkeletonTable';

import type { TableProps } from 'antd';
import type { ColumnsType } from 'antd/lib/table';

type ResponsiveTableProps = TableProps & {
  columns: ColumnsType;
  loading: boolean;
  rowCount?: number;
};

const ResponsiveTable = ({ columns, loading, rowCount = 10, ...restProps }: ResponsiveTableProps) => {
  const isLargeScreen = useIsLargeScreen();

  const getColumns = (columns: ColumnsType) => {
    if (!columns) return [];

    if (isLargeScreen) {
      return columns;
    }

    return responsiveColumns(columns);
  };

  const responsiveColumns = (columns: ColumnsType) => {
    if (!columns) return [];

    const result = [
      {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render: (_: string, record: any) => (
          <>
            {columns.map((column, index) => {
              const key = column.key as string;
              const value = record[key];
              const render = column?.render;
              return (
                <ResponsiveTableRow key={index}>
                  <ResponsiveTableRow.Title>{column.title as ReactNode}</ResponsiveTableRow.Title>
                  <ResponsiveTableRow.Value>
                    {(render && render(value, record, index)) ?? value}
                  </ResponsiveTableRow.Value>
                </ResponsiveTableRow>
              );
            })}
          </>
        ),
      },
    ];

    return result;
  };

  const tableColumns = getColumns(columns);
  if (isLargeScreen) {
    return <SkeletonTable rowCount={rowCount} loading={loading} columns={tableColumns as SkeletonTableColumnsType[]}>
      <Table showHeader={isLargeScreen} columns={tableColumns} {...restProps} />
    </SkeletonTable>
  }
  return <Table showHeader={isLargeScreen} columns={tableColumns} loading={loading} {...restProps} />
};

export default ResponsiveTable;
