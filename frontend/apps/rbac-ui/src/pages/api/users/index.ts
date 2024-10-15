import { UserRegionType } from '@vpcs/users-client';
import { crit } from '@/lib/Logger/server';
import { handleError } from '@/utils';
import type { NextApiRequest, NextApiResponse } from 'next';
import { resolveUserByEmailForRegion } from '@/lib/user';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return methodNotAllowed(res, req.method ?? 'Unknown');
  }

  const { email, region } = req.query;
  if (!email || typeof email !== 'string') {
    return badRequest(res, 'Email is required and must be a string');
  }

  if (!region || typeof region !== 'string') {
    return badRequest(res, 'Region is required and must be a string');
  }

  try {
    const response = await resolveUserByEmailForRegion(email, region as UserRegionType, req);
    if (!response) {
      return notFound(res, `User with email ${email} in region ${region} not found`);
    }
    const { user } = response;
    return res.status(200).json(user);
  } catch (error: unknown) {
    console.error(error);
    return crit({ req, res, error: handleError(error) });
  }
}

function methodNotAllowed(res: NextApiResponse, method: string) {
  res.setHeader('Allow', ['GET']);
  return res.status(405).json({ message: `Method ${method} Not Allowed` });
}

function badRequest(res: NextApiResponse, message: string) {
  return crit({ res, error: message, status: 400 });
}

function notFound(res: NextApiResponse, message: string) {
  return crit({ res, error: message, status: 404 });
}
