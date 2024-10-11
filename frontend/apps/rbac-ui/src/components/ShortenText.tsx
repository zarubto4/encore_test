import { Tooltip } from 'antd';

type ShortenTextProps = {
  text: string;
  maxLength?: number;
};

const shortenText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.substring(0, maxLength).trim()}...`;
};

export const ShortenText: React.FC<ShortenTextProps> = ({ text, maxLength = 20 }) => {
  const shortText = shortenText(text, maxLength);

  if (shortText === text) {
    return <span>{text}</span>;
  }

  return (
    <Tooltip title={text}>
      <span>{shortText}</span>
    </Tooltip>
  );
};
