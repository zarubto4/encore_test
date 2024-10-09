import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const headers = req.headers;
    return res.status(200).json(headers);
  } catch (error: unknown) {
    console.error(error);
  }
}