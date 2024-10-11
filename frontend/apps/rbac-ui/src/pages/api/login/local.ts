import { handleError, setCookie } from '@/utils';
import { resolveUserByEmailForRegion } from '@/lib/user';
import { USER_REGION } from 'libs/users-client/src';
import { signToken } from '@/lib/auth';

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }
    try {
      const responseNA = await resolveUserByEmailForRegion(email, USER_REGION.NA, req);
      const responseEMEA = await resolveUserByEmailForRegion(email, USER_REGION.EMEA, req);
      if (!responseNA?.user && !responseEMEA?.user) {
        const errorMessage = `Account with email ${email} was not found in any region`;
        console.error(errorMessage);
        return res.status(400).json({ message: errorMessage });
      }
      const maxAge = 60 * 60 * 24; // 1 day
      const token = await signToken({
        ...(responseNA?.user && { NA: responseNA.user }),
        ...(responseEMEA?.user && { EMEA: responseEMEA.user })
      }, maxAge);
      setCookie(res, token, { maxAge });

      res.status(200).json({ message: 'OK' });
    } catch (error: unknown) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
