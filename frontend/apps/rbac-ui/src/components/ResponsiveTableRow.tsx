import { ReactNode } from 'react';

interface RecordProps {
  children: ReactNode;
}

interface SubComponentProps {
  children: ReactNode;
}

const ResponsiveTableRow: React.FC<RecordProps> & { Title: React.FC<SubComponentProps>; Value: React.FC<SubComponentProps> } = ({
  children,
}) => {
  return <div className="flex my-5">{children}</div>;
};

ResponsiveTableRow.Title = ({ children }) => {
  return <div className="w-1/2 font-bold">{children}</div>;
};
ResponsiveTableRow.Title.displayName = 'Record.Title';

ResponsiveTableRow.Value = ({ children }) => {
  return <div className="w-1/2">{children}</div>;
};
ResponsiveTableRow.Value.displayName = 'Record.Value';

export default ResponsiveTableRow;
