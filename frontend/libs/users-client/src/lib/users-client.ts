import { parseError } from './utils';

type ErrorBody = {
  subject: string;
  errorCode: string;
};

type UID = string;

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

type CacheEntry<T> = {
  data: T;
  expiresAt: number;
};

// Global cache and expiration time
const cache: Map<string, CacheEntry<any>> = new Map();
const expireTime = 24 * 60 * 60 * 1000; // 24 hours

class ApiClient {
  private baseURL: string = process.env['NEXT_PRIVATE_USERS_API_URL'] || '';

  constructor(baseURL?: string) {
    if (baseURL) {
      this.baseURL = baseURL;
    }
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const apiKey = process.env['NEXT_PRIVATE_USERS_API_KEY'];
    if (!apiKey) {
      throw new Error('NEXT_PRIVATE_USERS_API_KEY is required');
    }
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers: {
        'x-api-key': apiKey,
      },
      ...options,
    });

    if (!response.ok) {
      throw (await response.json()) as ErrorResponse;
    }
    return response.json() as T;
  }

  private static getCachedResponse<T>(key: string): T | null {
    const cacheEntry = cache.get(key);
    if (cacheEntry && cacheEntry.expiresAt > Date.now()) {
      return cacheEntry.data;
    }
    cache.delete(key);
    return null;
  }

  private static setCachedResponse<T>(key: string, data: T, expire: number = expireTime): void {
    const expiresAt = Date.now() + expire;
    cache.set(key, { data, expiresAt });
  }

  public async validateToken(token: string): Promise<TokenValidationResponse> {
    const cacheKey = `validateToken-${token}`;
    const cachedResponse = ApiClient.getCachedResponse<TokenValidationResponse>(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }

    try {
      const formData = new FormData();
      formData.append('token', token);

      const response = await this.request<TokenValidationResponse>('/token/validation', {
        method: 'POST',
        body: formData,
      });
      ApiClient.setCachedResponse(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Error validating token:', error);
      throw error;
    }
  }

  public async getUserById(userId: string): Promise<AccountResponse[]> {
    const cacheKey = `getUserById-${userId}`;
    const cachedResponse = ApiClient.getCachedResponse<AccountResponse[]>(cacheKey);
    if (cachedResponse) {
      console.info(`Returning cached response for userId:#${userId}`);
      return cachedResponse;
    }

    try {
      const response = await this.request<AccountResponse[]>(`/accounts?id=${userId}`, {
        method: 'GET',
      });
      ApiClient.setCachedResponse(cacheKey, response);
      return response;
    } catch (error) {
      ApiClient.setCachedResponse(cacheKey, [], 30 * 1000); // 30 seconds
      console.error(`Error getting user by id:#${userId}`, error);
      throw error;
    }
  }

  public resolveUsersUids = async (userIds: string[]): Promise<Record<UID, UserType>> => {
    // Remove duplicates
    const uniqueUserIds = Array.from(new Set(userIds));

    // Create promises to fetch user data
    const usersPromises = uniqueUserIds.map(async (userId) => {
      try {
        const [user] = (await this.getUserById(userId)) as AccountSuccessResponse[];
        if (!user) throw new Error(`User with ID ${userId} not found`);

        return {
          [userId]: {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
          },
        };
      } catch (error) {
        return {
          [userId]: {
            firstName: null,
            lastName: null,
            email: null,
            error: parseError(error),
          },
        };
      }
    });

    // Resolve all promises
    const usersResolved = await Promise.all(usersPromises);

    // Combine results into a single object
    const users: Record<UID, UserType> = usersResolved.reduce((acc, user) => {
      const key = Object.keys(user)[0];
      acc[key] = user[key];
      return acc;
    }, {} as Record<UID, UserType>);

    return users;
  };

  public getUserFromEmail = async (email: string, domain = 'internal.na'): Promise<AccountSuccessResponse | null> => {
    const cacheKey = `getUserById-${email}`;
    const cachedResponse = ApiClient.getCachedResponse<AccountSuccessResponse>(cacheKey);
    if (cachedResponse) {
      console.info(`Returning cached response for email:${email}`);
      return cachedResponse;
    }

    try {
      const [user] = (await this.request<AccountResponse[]>(`/accounts?email=${email}&domain=${domain}`, {
        method: 'GET',
      })) as AccountSuccessResponse[];
      if (!user) {
        return null;
      }
      ApiClient.setCachedResponse(cacheKey, user);
      return user;
    } catch (error) {
      console.error(`Error getting user by email:${email} in domain ${domain}`, error);
      throw error;
    }
  };
}

export default ApiClient;
