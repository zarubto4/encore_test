import { Api, ApiConfig } from './lib/rbac-client';
import { StenoExpandedValueType, StenoKVRecordType } from '@vpcs/grpn-next-logging';

export * from './lib/rbac-client';

type LoggerFunction = (message: string, data?: StenoKVRecordType, ...optionalParams: unknown[]) => void;

type ApiClientData = {
  userId?: string;
  logger?: LoggerFunction;
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

  constructor({ userId = '', xRequestId = '', logger = undefined }: ApiClientData) {
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
        logger?.(`Sending request to RBAC-API`, {
          url: url.toString(),
          method: init?.method,
          headers: init?.headers as StenoExpandedValueType,
          body: init?.body ? JSON.parse(init?.body.toString()) : undefined,
        });
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

