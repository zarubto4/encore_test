import type { NextApiRequest, NextApiResponse } from 'next';
import { setCookie } from '@/lib/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  setCookie(res, '', { maxAge: 0 });

  // Redirect to the login page
  res.writeHead(302, { Location: '/login' });
  res.end();
}
