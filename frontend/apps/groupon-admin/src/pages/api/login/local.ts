import { parseError, setCookie } from '@/lib/utils';
import UsersApiClient from 'users-client';

import type { NextApiRequest, NextApiResponse } from 'next';

const userApiClient = new UsersApiClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email, domain = 'internal.na' } = req.body;

    if (!email) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }
    try {
      const user = await userApiClient.getUserFromEmail(email, domain);
      if (!user) {
        res.status(400).json({ message: `User ${email} in domain ${domain} not found` });
        return;
      }
      setCookie(res, JSON.stringify({ email, domain }), { maxAge: 60 * 60 * 24 * 360 }); // 360 days
      res.status(200).json({ message: 'User saved' });
    } catch (error: unknown) {
      console.error(error);
      return res.status(500).json({ message: parseError(error) });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
