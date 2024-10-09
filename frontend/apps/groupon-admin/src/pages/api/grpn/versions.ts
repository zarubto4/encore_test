import type { NextApiRequest, NextApiResponse } from 'next';

export default function versions(req: NextApiRequest, res: NextApiResponse): void {
  const data = {
    status: 'OK',
    time: new Date().toISOString(),
    sha: process.env.grpn_appSha,
    versions: JSON.parse(process.env.grpn_versions || '{}') as unknown,
  };

  return res.json(data);
}
