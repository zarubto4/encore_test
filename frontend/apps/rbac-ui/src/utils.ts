import { serialize } from 'cookie';
import type { CookieSerializeOptions } from 'cookie';
import { NextApiResponse } from 'next';

import { RBAC_TOKEN_COOKIE } from '@/constants';
import { IncomingMessage, ServerResponse } from 'http';

export { handleError } from 'libs/stdlib/src';

export const setCookie = (res: NextApiResponse | ServerResponse<IncomingMessage>, value: string, options: Partial<CookieSerializeOptions> = {}) => {
  const defaultOptions: CookieSerializeOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
  };
  const finalOptions = { ...defaultOptions, ...options };
  res.setHeader('Set-Cookie', serialize(RBAC_TOKEN_COOKIE, value, finalOptions));
};

export function addKeyToData(item: object, index: number) {
  return { key: index, ...item };
}

export const isValidEmail = (email: string): boolean => {
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailPattern.test(email);
};

export function formatDateString(dateString: string): string {
  const date = new Date(dateString);

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZoneName: 'short',
  };

  const formatter = new Intl.DateTimeFormat('en-US', options);
  const parts = formatter.formatToParts(date);

  const dateParts: { [key: string]: string } = {};
  for (const part of parts) {
    dateParts[part.type] = part.value;
  }

  return `${dateParts.year}-${dateParts.month}-${dateParts.day} ${dateParts.hour}:${dateParts.minute}`;
}

export const categoriesAsArray = (queryCategories: string | string[] | undefined): string[] => {
  if (!queryCategories) return [];
  return Array.isArray(queryCategories) ? queryCategories : [queryCategories];
};

export function fixEncoding(str: string) {
  const buffer = new Uint8Array([...str].map(char => char.charCodeAt(0)));  
  const decodedString = new TextDecoder('iso-8859-1').decode(buffer);  
  const utf8String = new TextEncoder().encode(decodedString);
  return new TextDecoder('utf-8').decode(utf8String);
}
