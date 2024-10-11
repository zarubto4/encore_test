import { NextApiRequest, NextApiResponse } from 'next';
import { server } from '@vpcs/grpn-next-logging/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query, body } = req;

  if (method === 'GET') {
    return res.json({ status: 'ok', message: 'metrics api', query });
  }

  if (method === 'POST') {
    // Create a new headers object without the cookie header
    const { cookie, ...headers } = req.headers;

    server.log().receive(req.body).data({ headers, body, query, method }).write();
    return res.json({ status: 200, message: 'logged' });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).json({ message: `Method ${method} Not Allowed` });
}
