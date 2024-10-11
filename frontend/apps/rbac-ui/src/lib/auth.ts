import { AccountSuccessResponse } from 'libs/users-client/src';
import { SignJWT, jwtVerify } from 'jose';

const SECRET_KEY = process.env.JWT_SECRET || 'asDhvG4g15UvssdFTYg1f651f5f-feYInbffd479';

export type UserPayload = {
  NA?: AccountSuccessResponse;
  EMEA?: AccountSuccessResponse;
};

export const signToken = (payload: UserPayload, expiration = 60 * 60): Promise<string> => {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + expiration;

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setExpirationTime(exp)
    .setIssuedAt(iat)
    .setNotBefore(iat)
    .sign(new TextEncoder().encode(SECRET_KEY));
};

export const verifyToken = async (token: string): Promise<UserPayload | null> => {
  const { payload } = await jwtVerify(token, new TextEncoder().encode(SECRET_KEY));
  return payload as UserPayload;
};
