import { handleError } from 'libs/stdlib/src';
import { Cache } from './cache';

// Constants
const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000';
const SYSTEM_USER_PAYLOAD = {
  id: SYSTEM_USER_ID,
  createdAt: '',
  brand: null,
  domain: 'internal.na',
  email: 'rbac@groupon.com',
  emailVerifiedAt: null,
  firstName: 'System',
  isEmailVerified: true,
  isRegistered: true,
  lastName: 'User',
  locale: 'en',
  registeredAt: '',
  updatedAt: '',
};

// Types
type ErrorBody = {
  subject: string;
  errorCode: string;
};

type UID = string;

export const USER_REGION = {
  NA: 'NA' as const,
  EMEA: 'EMEA' as const,
};

const HBRegion = {
  [USER_REGION.NA]: process.env['NEXT_PRIVATE_USERS_NA_REGION'] ?? 'us-central1',
  [USER_REGION.EMEA]: process.env['NEXT_PRIVATE_USERS_EMEA_REGION'] ?? 'us-west-2',
};

export type HBRegionEnum = (typeof HBRegion)[keyof typeof HBRegion];
export type UserRegionType = keyof typeof HBRegion;

export type UserType = {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  error?: string;
};

export type ErrorResponse = {
  errors: ErrorBody[];
};

export type TokenValidationSuccessResponse = {
  accountId: string;
  authenticatedAt: string;
  authenticationMethod: string;
};

export type TokenValidationResponse = TokenValidationSuccessResponse | ErrorResponse;

export type AccountSuccessResponse = {
  id: string;
  createdAt: string;
  brand: string | null;
  domain: string;
  email: string;
  emailVerifiedAt: string | null;
  firstName: string;
  isEmailVerified: boolean;
  isRegistered: boolean;
  lastName: string;
  locale: string;
  registeredAt: string;
  updatedAt: string;
};

export type AccountResponse = AccountSuccessResponse | ErrorResponse;

type ResolveUidsType = {
  userId: string;
  region?: UserRegionType;
};

class ApiClient {
  private baseUrl: string;
  private HBRegion: HBRegionEnum;
  private readonly API_KEY_NA: string | undefined;
  private readonly API_KEY_EMEA: string | undefined;
  private xRequestId?: string;

  constructor({ region = USER_REGION.NA, xRequestId }: { region?: UserRegionType; xRequestId?: string } = {}) {
    this.baseUrl = process.env['NEXT_PRIVATE_USERS_API_URL'] || 'http://users-service.staging.service/users/v1';
    this.HBRegion = HBRegion[region];
    this.API_KEY_NA = process.env['NEXT_PRIVATE_USERS_NA_API_KEY'];
    this.API_KEY_EMEA = process.env['NEXT_PRIVATE_USERS_EMEA_API_KEY'];

    if (!this.API_KEY_NA || !this.API_KEY_EMEA) {
      throw new Error('API keys for NA and EMEA regions are required');
    }

    this.xRequestId = xRequestId;
  }

  private async request<T>(endpoint: string, options?: RequestInit, region: HBRegionEnum = this.HBRegion): Promise<T> {
    const apiKey = region === HBRegion[USER_REGION.EMEA] ? this.API_KEY_EMEA : this.API_KEY_NA;
    const headers: Record<string, string> = {
      'x-api-key': apiKey ?? '',
      'X-HB-Region': region,
    };

    if (this.xRequestId) {
      headers['X-Request-ID'] = this.xRequestId;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, { headers: headers as HeadersInit, ...options });

    if (!response.ok) {
      throw (await response.json()) as ErrorResponse;
    }

    return response.json() as T;
  }

  public setRegion(region: UserRegionType) {
    if (!(region in USER_REGION)) {
      throw new Error(`Invalid region: ${region}`);
    }
    this.HBRegion = HBRegion[region];
  }

  public getRegion(): UserRegionType {
    const regionKey = (Object.keys(HBRegion) as Array<UserRegionType>).find((key) => HBRegion[key] === this.HBRegion);
    if (!regionKey) {
      throw new Error(`Unable to determine region for HBRegion value: ${this.HBRegion}`);
    }
    return regionKey;
  }

  public async validateToken(token: string, region: UserRegionType = USER_REGION.NA): Promise<TokenValidationResponse> {
    const _region = HBRegion[region];
    const cacheKey = `validateToken-${token}-${_region}`;
    const cachedResponse = Cache.get<TokenValidationResponse>(cacheKey);

    if (cachedResponse) {
      return cachedResponse;
    }

    try {
      const formData = new FormData();
      formData.append('token', token);

      const response = await this.request<TokenValidationResponse>(
        '/token/validation',
        { method: 'POST', body: formData },
        _region,
      );

      Cache.set(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Error validating token:', error);
      throw error;
    }
  }

  public async getUserById(userId: string, region: UserRegionType = USER_REGION.NA): Promise<AccountResponse[]> {
    if (userId === SYSTEM_USER_ID) {
      return [SYSTEM_USER_PAYLOAD];
    }

    const _region = HBRegion[region];
    const cacheKey = `getUserById-${userId}-${region}`;
    const cachedResponse = Cache.get<AccountResponse[]>(cacheKey);

    if (cachedResponse) {
      console.info(`Returning cached response for userId:#${userId}`);
      return cachedResponse;
    }

    try {
      const response = await this.request<AccountResponse[]>(`/accounts?id=${userId}`, { method: 'GET' }, _region);
      Cache.set(cacheKey, response);
      return response;
    } catch (error) {
      Cache.set(cacheKey, [], 30 * 1000); // Cache empty response for 30 seconds
      console.error(`Error getting user by id:#${userId}`, error);
      throw error;
    }
  }

  public async resolveUsersUids(list: ResolveUidsType[]): Promise<Record<UID, UserType>> {
    const uniqueUsers = Array.from(
      new Map(list.map((item) => [`${item.userId}_${item.region ?? USER_REGION.NA}`, item])).values(),
    );

    const usersResolved = await Promise.all(
      uniqueUsers.map(async ({ userId, region }) => {
        try {
          const [user] = (await this.getUserById(userId, region)) as AccountSuccessResponse[];
          if (!user) throw new Error(`User with ID ${userId} in region ${region} not found`);

          return { [userId]: { firstName: user.firstName, lastName: user.lastName, email: user.email } };
        } catch (error) {
          return { [userId]: { firstName: null, lastName: null, email: null, error: handleError(error) } };
        }
      }),
    );

    return usersResolved.reduce((acc, user) => {
      const key = Object.keys(user)[0];
      acc[key] = user[key];
      return acc;
    }, {} as Record<UID, UserType>);
  }

  public async getUserFromEmail(
    email: string,
    domain = 'internal.na',
    region: UserRegionType = 'NA',
  ): Promise<AccountSuccessResponse | null> {
    if (!(region in HBRegion)) {
      throw new Error(`Invalid region: ${region}`);
    }

    const _region = HBRegion[region];
    const cacheKey = `getUserFromEmail-${email}-${domain}-${_region}`;
    const cachedResponse = Cache.get<AccountSuccessResponse>(cacheKey);

    if (cachedResponse) {
      console.info(`Returning cached response for email:#${email}`);
      return cachedResponse;
    }

    try {
      const [user] = (await this.request<AccountResponse[]>(
        `/accounts?email=${email}&domain=${domain}`,
        { method: 'GET' },
        _region,
      )) as AccountSuccessResponse[];

      if (!user) {
        return null;
      }

      Cache.set(cacheKey, user);
      return user;
    } catch (error) {
      console.error(`Error getting user by email:${email} in domain ${domain}`, error);
      throw error;
    }
  }
}

export default ApiClient;
