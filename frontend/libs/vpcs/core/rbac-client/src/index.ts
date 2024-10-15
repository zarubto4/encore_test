import { Api, ApiConfig } from './lib/rbac-client';

export * from './lib/rbac-client';

type ApiClientData = {
  userId?: string;
  xRequestId?: string;
};

export type SecurityData = {
  headers?: {
    userId?: string;
  };
};

export class RbacApiClient {
  public api: Api<SecurityData>;
  private userId: string;
  private apiConfig: ApiConfig;
  private clientId = process.env['NEXT_PRIVATE_RBAC_CLIEND_ID'] ?? '91e489c2caa8471d8550c7f7908ad94a_rbacui';
  private baseUrl = process.env['NEXT_PRIVATE_RBAC_API_URL'] ?? 'http://rbac.staging.service';
  private xRequestId: string;

  constructor({ userId = '', xRequestId = '' }: ApiClientData) {
    this.userId = userId;
    this.xRequestId = xRequestId;
    this.apiConfig = {
      baseUrl: this.baseUrl,
      baseApiParams: {
        secure: true,
      },
      customFetch: (input, init) => {
        const url = new URL(input.toString());
        url.searchParams.set('client_id', this.clientId);
        return fetch(url.toString(), init);
      },
      securityWorker: () => {
        return {
          headers: {
            ...(this.userId && { requester_user_id: this.userId }),
            ...(this.xRequestId && { 'X-Request-ID': this.xRequestId }),
          },
        };
      },
    };

    this.api = new Api<SecurityData>(this.apiConfig);
  }

  setUserId(newUserId: string) {
    this.userId = newUserId;
  }

  getUserId() {
    return this.userId;
  }
}

