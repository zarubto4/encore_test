/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface ErrorResponse {
  /** @example "error-0001" */
  code: string;
  /** @example "Description of the error" */
  message: string;
}

export interface PermissionsRequest {
  /** @example "USER:PROFILE:READ" */
  code: string;
  /** @example "Gives permission to read user profile" */
  description: string;
  /**
   * @minItems 1
   * @example ["9bc235cd-21e1-4db7-9ede-9d6a40a3d93b","1c7467a7-1bb3-480d-9322-015680f280d4"]
   */
  categories: string[];
}

export interface PermissionsPatchRequest {
  /** @example "Gives permission to create voucher" */
  description?: string;
  /** @example ["26e25e6b-203b-4ef4-89bd-86779e4413d2","01ed06f8-e9df-4527-894f-01cd54f58d61"] */
  categories?: string[];
}

export interface PermissionsResponse {
  /**
   * @format uuid
   * @example "2a80f305-6928-40bc-be93-e9fb39b671c4"
   */
  id: string;
  /** @example "USER:PROFILE:READ" */
  code: string;
  /** @example "Gives permission to read user profile" */
  description: string;
  /**
   * @format date-time
   * @example "2023-03-15 13:51:21.000"
   */
  createdAt: string;
  /**
   * @format uuid
   * @example "24087863-cb92-4245-a7bf-c4e425cbb7ce"
   */
  createdBy: string;
  /**
   * @format date-time
   * @example "2023-03-15 13:51:21.000"
   */
  lastModifiedAt?: string;
  /**
   * @format uuid
   * @example "24087863-cb92-4245-a7bf-c4e425cbb7ce"
   */
  lastModifiedBy?: string;
  categories?: {
    /**
     * @format uuid
     * @example "d975a0f3-17de-491f-b321-dffbd6d85f56"
     */
    id?: string;
    /** @example "Category 1" */
    name?: string;
  }[];
}

export interface RolesCreateRequest {
  /** @example "Merchant Admin" */
  name: string;
  /** @example "Gives access to everything for a merchant" */
  description: string;
  /**
   * @minItems 1
   * @example ["3de29e80-e68b-4bf6-acba-d2604add285e","8dc4e848-be68-4741-a316-990a139cad17","336dfaa2-4ae1-4805-bb44-7b41eef5975e"]
   */
  permissions?: string[];
  /**
   * @minItems 1
   * @example ["dc4e9a42-fa4e-4942-84b3-4d764b74da1e","8ab19e73-4f57-46d1-8428-666d3f58a278"]
   */
  categories?: string[];
}

export interface RolesPatchRequest {
  /** @example "Gives access to everything for a merchant" */
  description?: string;
  /**
   * @minItems 1
   * @example ["b7a7f25a-8ca5-4201-88cc-406781af5062","cd1f0988-6630-459c-b6e1-b45c43449688","3b6748a9-cb9b-41bb-bab0-d486854fcb6d"]
   */
  permissions?: string[];
  /**
   * @minItems 1
   * @example ["7a954c64-1865-494c-86ee-aa5b9c5a3866","1c320bf7-ef8d-4802-9817-539b5159f965"]
   */
  categories?: string[];
}

export interface RolesResponse {
  /**
   * @format uuid
   * @example "eb54a30b-8a5e-4bd1-8701-3402aec7eb18"
   */
  id: string;
  /** @example "Merchant Admin" */
  name: string;
  /** @example "Gives access to everything for a merchant" */
  description: string;
  /**
   * @format date-time
   * @example "2023-03-15 13:51:21.000"
   */
  createdAt: string;
  /**
   * @format uuid
   * @example "24087863-cb92-4245-a7bf-c4e425cbb7ce"
   */
  createdBy: string;
  /**
   * @format date-time
   * @example "2023-03-15 13:51:21.000"
   */
  lastModifiedAt?: string;
  /**
   * @format uuid
   * @example "24087863-cb92-4245-a7bf-c4e425cbb7ce"
   */
  lastModifiedBy?: string;
  /** @minItems 1 */
  permissions?: {
    /**
     * @format uuid
     * @example "d975a0f3-17de-491f-b321-dffbd6d85f56"
     */
    id?: string;
    /** @example "Permission 1" */
    name?: string;
  }[];
  /** @minItems 1 */
  categories?: {
    /**
     * @format uuid
     * @example "d975a0f3-17de-491f-b321-dffbd6d85f56"
     */
    id?: string;
    /** @example "Category 1" */
    name?: string;
  }[];
}

export interface RoleIdResponse {
  /**
   * @format uuid
   * @example "eb54a30b-8a5e-4bd1-8701-3402aec7eb18"
   */
  id: string;
  /** @example "Merchant Admin" */
  name: string;
  /** @example "Gives access to everything for a merchant" */
  description: string;
  /**
   * @format date-time
   * @example "2023-03-15 13:51:21.000"
   */
  createdAt: string;
  /**
   * @format uuid
   * @example "24087863-cb92-4245-a7bf-c4e425cbb7ce"
   */
  createdBy: string;
  /**
   * @format date-time
   * @example "2023-03-15 13:51:21.000"
   */
  lastModifiedAt?: string;
  /**
   * @format uuid
   * @example "24087863-cb92-4245-a7bf-c4e425cbb7ce"
   */
  lastModifiedBy?: string;
  /** @minItems 1 */
  permissions?: PermissionsResponse[];
  /** @minItems 1 */
  categories?: {
    /**
     * @format uuid
     * @example "d975a0f3-17de-491f-b321-dffbd6d85f56"
     */
    id?: string;
    /** @example "Category 1" */
    name?: string;
  }[];
}

/** Supported scope types */
export type ScopeType = string;

/** Valid role request status */
export enum RoleRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export interface ScopeTypeCreateRequest {
  /** Supported scope types */
  scopeType: ScopeType;
  /** @example "Gives access to all merchants" */
  description: string;
}

export interface ScopeTypeCreateResponse {
  /** Supported scope types */
  scopeType: ScopeType;
  /** @example "Gives access to all merchants" */
  description: string;
  /**
   * @format date-time
   * @example "2023-03-15 13:51:21.000"
   */
  createdAt: string;
  /**
   * @format uuid
   * @example "9032bc8c-185a-4c8e-891e-3665d0cd82fe"
   */
  createdBy: string;
  /**
   * @format date-time
   * @example "2023-03-15 13:51:21.000"
   */
  lastModifiedAt?: string;
  /**
   * @format uuid
   * @example "24087863-cb92-4245-a7bf-c4e425cbb7ce"
   */
  lastModifiedBy?: string;
}

export interface UserRolesCreateResponse {
  /**
   * @format uuid
   * @example "0b583421-f29d-4c01-b5de-60b6277660b5"
   */
  userId: string;
  /**
   * @format uuid
   * @example "baf4e1af-fb31-445e-9505-6b45969cad30"
   */
  roleId: string;
  /** Supported scope types */
  scopeType: ScopeType;
  /** @example "f23d6989-dc48-4c36-a596-c7fb6e70467c" */
  scopeValue?: string;
  /** @example "Reason for providing access" */
  comments: string;
  /**
   * @format date-time
   * @example "2023-03-15 13:51:21.000"
   */
  createdAt: string;
  /**
   * @format uuid
   * @example "9032bc8c-185a-4c8e-891e-3665d0cd82fe"
   */
  createdBy: string;
  /**
   * @format date-time
   * @example "2023-03-15 13:51:21.000"
   */
  lastModifiedAt?: string;
  /**
   * @format uuid
   * @example "9032bc8c-185a-4c8e-891e-3665d0cd82fe"
   */
  lastModifiedBy?: string;
  region: string;
}

export interface UserRolesCreateRequestRequest {
  /**
   * @format uuid
   * @example "cc4cfe53-6f54-4066-851d-94ba87181e10"
   */
  roleId: string;
  /** Supported scope types */
  scopeType: ScopeType;
  /** @example "f23d6989-dc48-4c36-a596-c7fb6e70467c" */
  scopeValue?: string;
  /** @example "Reason why you want the access" */
  comment: string;
  region: string;
}

export interface UserRolesCreateRequestResponse {
  /**
   * @format uuid
   * @example "43324a78-2a78-4919-a94c-cf714e007546"
   */
  id: string;
  /**
   * @format uuid
   * @example "0b583421-f29d-4c01-b5de-60b6277660b5"
   */
  requesterId: string;
  /** @example "Reason for access" */
  requesterComment: string;
  /** Valid role request status */
  status: RoleRequestStatus;
  /**
   * @format uuid
   * @example "06b158da-f4f5-410d-bac5-b7b46c7bda4d"
   */
  approverId?: string;
  /** @example "Reason for rejection/approval" */
  approverComment?: string;
  /**
   * @format uuid
   * @example "62ddb540-6b7f-4f13-9023-dc4f2567c6fa"
   */
  roleId: string;
  /** Supported scope types */
  scopeType: ScopeType;
  /** @example "f23d6989-dc48-4c36-a596-c7fb6e70467c" */
  scopeValue?: string;
  /**
   * @format date-time
   * @example "2023-03-15 13:51:21.000"
   */
  createdAt: string;
  /**
   * @format date-time
   * @example "2023-03-15 13:51:21.000"
   */
  lastModifiedAt?: string;
  region: string;
}

export interface UserPermissionsResponse {
  /** @example "211f225d-3593-4c3a-b92a-1e3cb80d8435" */
  roleId: string;
  /** Supported scope types */
  scopeType: ScopeType;
  /** @example "d106446a-2b76-474c-b778-e4a1df80725e" */
  scopeValue?: string;
  /**
   * @minItems 1
   * @example ["USER:PROFILE:CREATE","USER:PROFILE:READ"]
   */
  permissions?: string[];
}

export interface CategoriesCreateRequest {
  /** @example "INTERNAL" */
  name: string;
  /** @example "Explanation of category" */
  description: string;
}

export interface CategoriesCreateResponse {
  /**
   * @format uuid
   * @example "1bfdc31d-76b1-4725-a97c-2351002c5b74"
   */
  id: string;
  /** @example "INTERNAL" */
  name: string;
  /** @example "Explanation of category" */
  description: string;
  /**
   * @format date-time
   * @example "2023-03-15 13:51:21.000"
   */
  createdAt: string;
  /**
   * @format uuid
   * @example "06b158da-f4f5-410d-bac5-b7b46c7bda4d"
   */
  createdBy: string;
  /**
   * @format date-time
   * @example "2023-03-15 13:51:21.000"
   */
  lastModifiedAt?: string;
  /**
   * @format uuid
   * @example "06b158da-f4f5-410d-bac5-b7b46c7bda4d"
   */
  lastModifiedBy?: string;
}

export interface RolesOwnersResponse {
  /**
   * @format uuid
   * @example "1bfdc31d-76b1-4725-a97c-2351002c5b74"
   */
  roleId: string;
  /**
   * @format uuid
   * @example "06b158da-f4f5-410d-bac5-b7b46c7bda4d"
   */
  ownerId: string;
  /**
   * @format date-time
   * @example "2023-03-15 13:51:21.000"
   */
  createdAt: string;
  /**
   * @format uuid
   * @example "06b158da-f4f5-410d-bac5-b7b46c7bda4d"
   */
  createdBy: string;
  /** @example "Description as to why the user was made an owner" */
  comments: string;
  region: string;
}

export interface RolesOwnersRequest {
  /**
   * @format uuid
   * @example "1bfdc31d-76b1-4725-a97c-2351002c5b74"
   */
  roleId: string;
  /**
   * @format uuid
   * @example "06b158da-f4f5-410d-bac5-b7b46c7bda4d"
   */
  ownerId: string;
  /** @example "Description as to why the user was made an owner" */
  comments: string;
  region: string;
}

export interface AuditResponse {
  /**
   * @format uuid
   * @example "eb54a30b-8a5e-4bd1-8701-3402aec7eb18"
   */
  userId: string;
  /** @example "Created" */
  action: string;
  /** @example "Permission" */
  objectType: string;
  /** @example "RBAC:USER:CREATE" */
  objectName: string;
  /** @example "Role Name" */
  affectedObject?: string;
  /**
   * @format date-time
   * @example "2023-03-15 13:51:21.000"
   */
  timestamp: string;
  region: string;
}

export interface PaginatedPermissionsResponse {
  items: PermissionsResponse[];
  /** @example "4" */
  totalNumberOfPages: number;
  /** @example "12" */
  totalNumberOfElements: number;
  /** @example "5" */
  pageSize: number;
  /** @example "1" */
  page: number;
}

export interface PaginatedUserRoleRequestsResponse {
  items: UserRolesCreateRequestResponse[];
  /** @example "4" */
  totalNumberOfPages: number;
  /** @example "12" */
  totalNumberOfElements: number;
  /** @example "5" */
  pageSize: number;
  /** @example "1" */
  page: number;
}

export interface PaginatedUserRolesResponse {
  items: UserRolesCreateResponse[];
  /** @example "4" */
  totalNumberOfPages: number;
  /** @example "12" */
  totalNumberOfElements: number;
  /** @example "5" */
  pageSize: number;
  /** @example "1" */
  page: number;
}

export interface PaginatedRolesResponse {
  items: RolesResponse[];
  /** @example "4" */
  totalNumberOfPages: number;
  /** @example "12" */
  totalNumberOfElements: number;
  /** @example "5" */
  pageSize: number;
  /** @example "1" */
  page: number;
}

export interface PaginatedAuditResponse {
  items: AuditResponse[];
  /** @example "4" */
  totalNumberOfPages: number;
  /** @example "12" */
  totalNumberOfElements: number;
  /** @example "5" */
  pageSize: number;
  /** @example "1" */
  page: number;
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, 'body' | 'bodyUsed'>;

export interface FullRequestParams extends Omit<RequestInit, 'body'> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<FullRequestParams, 'body' | 'method' | 'query' | 'path'>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, 'baseUrl' | 'cancelToken' | 'signal'>;
  securityWorker?: (securityData: SecurityDataType | null) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown> extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = 'application/json',
  FormData = 'multipart/form-data',
  UrlEncoded = 'application/x-www-form-urlencoded',
  Text = 'text/plain',
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = '';
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>['securityWorker'];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) => fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: 'same-origin',
    headers: {},
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === 'number' ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join('&');
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter((key) => 'undefined' !== typeof query[key]);
    return keys
      .map((key) => (Array.isArray(query[key]) ? this.addArrayQueryParam(query, key) : this.addQueryParam(query, key)))
      .join('&');
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : '';
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === 'object' || typeof input === 'string') ? JSON.stringify(input) : input,
    [ContentType.Text]: (input: any) => (input !== null && typeof input !== 'string' ? JSON.stringify(input) : input),
    [ContentType.FormData]: (input: FormData) => {
      const formData = new FormData();
      input.forEach((value, key) => {
        formData.append(
          key,
          value instanceof Blob
            ? value
            : typeof value === 'object' && value !== null
              ? JSON.stringify(value)
              : `${value}`,
        );
      });
      return formData;
    },
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(params1: RequestParams, params2?: RequestParams): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (cancelToken: CancelToken): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === 'boolean' ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(`${baseUrl || this.baseUrl || ''}${path}${queryString ? `?${queryString}` : ''}`, {
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type && type !== ContentType.FormData ? { 'Content-Type': type } : {}),
      },
      signal: (cancelToken ? this.createAbortSignal(cancelToken) : requestParams.signal) || null,
      body: typeof body === 'undefined' || body === null ? null : payloadFormatter(body),
    }).then(async (response) => {
      const r = response.clone() as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const data = !responseFormat
        ? r
        : await response[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title RBAC service
 * @version v2
 *
 * RBAC service allows creating permissions and assigning those permissions to roles.
 * Users can then be assigned the roles within a scope to provide access.
 *
 * Useful links:
 * - [Guidelines for naming permissions](https://groupondev.atlassian.net/wiki/x/CoAV4RI)
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  v2 = {
    /**
     * @description Creates a permission. The code needs to be unique and category should already exist. Have a meaningful name for the code as the code will be used by clients to authorize requests.
     *
     * @tags Permissions
     * @name PermissionsCreate
     * @request POST:/v2/permissions
     */
    permissionsCreate: (data: PermissionsRequest, params: RequestParams = {}) =>
      this.request<PermissionsResponse, ErrorResponse>({
        path: `/v2/permissions`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get all permissions. Optionally, can be filtered on categoryNames, categoryIds, createdBy, createdFrom and createdTo.
     *
     * @tags Permissions
     * @name PermissionsList
     * @request GET:/v2/permissions
     */
    permissionsList: (
      query?: {
        /**
         * Filter permissions matching all categories ID.The items are comma separated.
         * @example ["edb85006-0690-44be-a8e3-424da5c7510e,2959a073-3ee6-4d46-9f07-0daffb7fb827"]
         */
        categoryIds?: string;
        /**
         * Filter permissions created by the user
         * @format uuid
         * @example "d8db4e13-570b-4b35-8249-bb25d4482bec"
         */
        createdBy?: string;
        /**
         * Filter permissions created on/after the date
         * @format date
         * @example "2023-03-15"
         */
        createdFrom?: string;
        /**
         * Filter permissions created on/before the date
         * @format date
         * @example "2023-03-30"
         */
        createdTo?: string;
        /**
         * Filter permissions on the basis of permission code
         * @example "RBAC:TEST:DELETE"
         */
        permissionCode?: string;
        /**
         * Give information about the page number
         * @example "0"
         */
        page?: number;
        /**
         * Give information for number of items to get in one request
         * @example "0"
         */
        size?: number;
        /**
         * sort the required data
         * @example "name,desc"
         */
        sort?: string;
        /**
         * Filter to include deleted permissions as well.
         * @example "deleted"
         */
        show?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<PaginatedPermissionsResponse, ErrorResponse>({
        path: `/v2/permissions`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get details of a permission by id
     *
     * @tags Permissions
     * @name PermissionsDetail
     * @request GET:/v2/permissions/{permissionId}
     */
    permissionsDetail: (permissionId: string, params: RequestParams = {}) =>
      this.request<PermissionsResponse, ErrorResponse>({
        path: `/v2/permissions/${permissionId}`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * @description Update an existing permission. Only updates to description and category is allowed. **The supplied categories will be added to the permission.**
     *
     * @tags Permissions
     * @name PermissionsPartialUpdate
     * @request PATCH:/v2/permissions/{permissionId}
     */
    permissionsPartialUpdate: (permissionId: string, data: PermissionsPatchRequest, params: RequestParams = {}) =>
      this.request<PermissionsResponse, ErrorResponse>({
        path: `/v2/permissions/${permissionId}`,
        method: 'PATCH',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Delete a permission by id. The deleted permission will to be removed from all roles
     *
     * @tags Permissions
     * @name PermissionsDelete
     * @request DELETE:/v2/permissions/{permissionId}
     */
    permissionsDelete: (permissionId: string, params: RequestParams = {}) =>
      this.request<void, ErrorResponse>({
        path: `/v2/permissions/${permissionId}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * @description Delete a category from a permisson.
     *
     * @tags Permissions
     * @name PermissionsCategoriesDelete
     * @request DELETE:/v2/permissions/{permissionId}/categories/{categoryId}
     */
    permissionsCategoriesDelete: (permissionId: string, categoryId: string, params: RequestParams = {}) =>
      this.request<void, ErrorResponse>({
        path: `/v2/permissions/${permissionId}/categories/${categoryId}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * @description Creates a role
     *
     * @tags Roles
     * @name RolesCreate
     * @request POST:/v2/roles
     */
    rolesCreate: (data: RolesCreateRequest, params: RequestParams = {}) =>
      this.request<RolesResponse, ErrorResponse>({
        path: `/v2/roles`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get all roles. Optionally, can be filtered on categoryIds, permissionIds, createdBy, createdFrom and createdTo.
     *
     * @tags Roles
     * @name RolesList
     * @request GET:/v2/roles
     */
    rolesList: (
      query?: {
        /**
         * Filter roles having all categoryIds. The items are comma separated and is an AND filter.
         * @example ["edb85006-0690-44be-a8e3-424da5c7510e,2959a073-3ee6-4d46-9f07-0daffb7fb827"]
         */
        categoryIds?: string;
        /**
         * Filter roles created by the user
         * @format uuid
         * @example "d8db4e13-570b-4b35-8249-bb25d4482bec"
         */
        createdBy?: string;
        /**
         * Filter roles created on/after the supplied date
         * @format date
         * @example "2023-03-15"
         */
        createdFrom?: string;
        /**
         * Filter roles created on/before the supplied date
         * @format date
         * @example "2023-03-30"
         */
        createdTo?: string;
        /**
         * Filter roles having all permissionIds. The items are comma separated and is an AND filter.
         * @minItems 1
         */
        permissionIds?: string;
        /**
         * Filter roles on the basis of name
         * @example "Developer"
         */
        roleName?: string;
        /**
         * Give information about the page number
         * @example "0"
         */
        page?: number;
        /**
         * Give information for number of items to get in one request
         * @example "0"
         */
        size?: number;
        /**
         * sort the required data
         * @example "name,desc"
         */
        sort?: string;
        /**
         * Filter to include deleted roles as well.
         * @example "deleted"
         */
        show?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<PaginatedRolesResponse, ErrorResponse>({
        path: `/v2/roles`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get details of a role by id
     *
     * @tags Roles
     * @name RolesDetail
     * @request GET:/v2/roles/{roleId}
     */
    rolesDetail: (
      roleId: string,
      query?: {
        /**
         * Query param to control the categories and permissions field in the response. When show="minimal categories and permissions fields are returned as null.
         * @example "minimal"
         */
        show?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<RoleIdResponse, ErrorResponse>({
        path: `/v2/roles/${roleId}`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * @description Updates an existing role. Update to description, permissions and categories are allowed. **Supplied permissions and categories will be added to the role.**
     *
     * @tags Roles
     * @name RolesPartialUpdate
     * @request PATCH:/v2/roles/{roleId}
     */
    rolesPartialUpdate: (roleId: string, data: RolesPatchRequest, params: RequestParams = {}) =>
      this.request<RolesResponse, ErrorResponse>({
        path: `/v2/roles/${roleId}`,
        method: 'PATCH',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Delete a role. The deleted role will be unassigned from all users.
     *
     * @tags Roles
     * @name RolesDelete
     * @request DELETE:/v2/roles/{roleId}
     */
    rolesDelete: (roleId: string, params: RequestParams = {}) =>
      this.request<void, ErrorResponse>({
        path: `/v2/roles/${roleId}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * @description Delete a category from a role.
     *
     * @tags Roles
     * @name RolesCategoriesDelete
     * @request DELETE:/v2/roles/{roleId}/categories/{categoryId}
     */
    rolesCategoriesDelete: (roleId: string, categoryId: string, params: RequestParams = {}) =>
      this.request<void, ErrorResponse>({
        path: `/v2/roles/${roleId}/categories/${categoryId}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * @description Delete a permission from a role.
     *
     * @tags Roles
     * @name RolesPermissionsDelete
     * @request DELETE:/v2/roles/{roleId}/permissions/{permissionId}
     */
    rolesPermissionsDelete: (roleId: string, permissionId: string, params: RequestParams = {}) =>
      this.request<void, ErrorResponse>({
        path: `/v2/roles/${roleId}/permissions/${permissionId}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * @description Create a owner for a role
     *
     * @tags Roles Ownership
     * @name RolesOwnersCreate
     * @request POST:/v2/roles/owners
     */
    rolesOwnersCreate: (data: RolesOwnersRequest, params: RequestParams = {}) =>
      this.request<RolesOwnersResponse, ErrorResponse>({
        path: `/v2/roles/owners`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get owners for roles. Optionally, can be filtered on roleId, owners, fromDate, toDate
     *
     * @tags Roles Ownership
     * @name RolesOwnersList
     * @request GET:/v2/roles/owners
     */
    rolesOwnersList: (
      query?: {
        /**
         * Filter users who are owners for all the given role Ids. The items are comma separated and is an AND filter
         * @example ["cb94a125-f59d-4f7e-a0dc-111cc2643803,f958913c-27a7-44c4-a190-714e9d43fd29"]
         */
        roleIds?: string;
        /**
         * Fitler roles that has all of the listed owners. The items are comma separated and is an AND filter
         * @example ["fadc7287-7f52-48a2-9638-95c56d4424cf,ecc0bcf3-543f-4008-9a5b-f651225ef13a"]
         */
        ownerIds?: string;
        /**
         * User who created an owner for the role
         * @format uuid
         * @example "d8db4e13-570b-4b35-8249-bb25d4482bec"
         */
        createdBy?: string;
        /**
         * Date on/after which a user was made an owner
         * @format date
         * @example "2023-03-15"
         */
        createdFrom?: string;
        /**
         * Date on/before which a user was made an owner.
         * @format date
         * @example "2023-03-30"
         */
        createdTo?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<RolesOwnersResponse[], ErrorResponse>({
        path: `/v2/roles/owners`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get details of the owner for a role
     *
     * @tags Roles Ownership
     * @name RolesOwnersDetail
     * @request GET:/v2/roles/{roleId}/owners/{ownerId}
     */
    rolesOwnersDetail: (roleId: string, ownerId: string, params: RequestParams = {}) =>
      this.request<RolesOwnersResponse, ErrorResponse>({
        path: `/v2/roles/${roleId}/owners/${ownerId}`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * @description Remove a user as an owner for a role
     *
     * @tags Roles Ownership
     * @name RolesOwnersDelete
     * @request DELETE:/v2/roles/{roleId}/owners/{ownerId}
     */
    rolesOwnersDelete: (roleId: string, ownerId: string, params: RequestParams = {}) =>
      this.request<void, ErrorResponse>({
        path: `/v2/roles/${roleId}/owners/${ownerId}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * @description Submit a request for access to a role for a particular scope
     *
     * @tags Roles request and approval
     * @name RolesRequestsCreate
     * @request POST:/v2/roles/requests
     */
    rolesRequestsCreate: (data: UserRolesCreateRequestRequest, params: RequestParams = {}) =>
      this.request<UserRolesCreateRequestResponse, ErrorResponse>({
        path: `/v2/roles/requests`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get roles requests made by users. Optionally, can be filtered roleId, roleOwnerId and status.
     *
     * @tags Roles request and approval
     * @name RolesRequestsList
     * @request GET:/v2/roles/requests
     */
    rolesRequestsList: (
      query?: {
        /**
         * requesterId
         * @format uuid
         * @example "e842a88f-ce62-4234-9ce6-86cd8a73923c"
         */
        requesterId?: string;
        /**
         * role Id
         * @format uuid
         * @example "d8db4e13-570b-4b35-8249-bb25d4482bec"
         */
        roleId?: string;
        /**
         * roleOwnerId
         * @format uuid
         * @example "20bda1c4-7483-4566-935e-3975f33a139e"
         */
        roleOwnerId?: string;
        /** status */
        status?: RoleRequestStatus;
        /**
         * Give information about the page number
         * @example "0"
         */
        page?: number;
        /**
         * Give information for number of items to get in one request
         * @example "0"
         */
        size?: number;
        /**
         * sort the required data
         * @example "name,desc"
         */
        sort?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<PaginatedUserRoleRequestsResponse, ErrorResponse>({
        path: `/v2/roles/requests`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * @description Approve/Reject/Cancel a role request. Only allowed if the request state is pending
     *
     * @tags Roles request and approval
     * @name RolesRequestsUpdate
     * @request PUT:/v2/roles/requests/{requestId}
     */
    rolesRequestsUpdate: (
      requestId: string,
      data: {
        /** @example "Reason why the request is approved, rejected or cancelled" */
        comment: string;
        /** Valid role request status */
        status: RoleRequestStatus;
      },
      params: RequestParams = {},
    ) =>
      this.request<UserRolesCreateRequestResponse, ErrorResponse>({
        path: `/v2/roles/requests/${requestId}`,
        method: 'PUT',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Create a category
     *
     * @tags Categories
     * @name CategoriesCreate
     * @request POST:/v2/categories
     */
    categoriesCreate: (data: CategoriesCreateRequest, params: RequestParams = {}) =>
      this.request<CategoriesCreateResponse, ErrorResponse>({
        path: `/v2/categories`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get all categories. Optionally, can be filtered on createdBy, from and to.
     *
     * @tags Categories
     * @name CategoriesList
     * @request GET:/v2/categories
     */
    categoriesList: (
      query?: {
        /**
         * Filter categories created by the user
         * @format uuid
         * @example "d8db4e13-570b-4b35-8249-bb25d4482bec"
         */
        createdBy?: string;
        /**
         * Filter categories created on/after the date
         * @format date
         * @example "2023-03-15"
         */
        createdFrom?: string;
        /**
         * Filter categories created on/before the date
         * @format date
         * @example "2023-03-30"
         */
        createdTo?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<CategoriesCreateResponse[], ErrorResponse>({
        path: `/v2/categories`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get details of a category by id
     *
     * @tags Categories
     * @name CategoriesDetail
     * @request GET:/v2/categories/{categoryId}
     */
    categoriesDetail: (categoryId: string, params: RequestParams = {}) =>
      this.request<CategoriesCreateResponse, ErrorResponse>({
        path: `/v2/categories/${categoryId}`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * @description Update category description
     *
     * @tags Categories
     * @name CategoriesPartialUpdate
     * @request PATCH:/v2/categories/{categoryId}
     */
    categoriesPartialUpdate: (
      categoryId: string,
      data: {
        /** @example "Updated description of the category" */
        description?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<CategoriesCreateResponse, ErrorResponse>({
        path: `/v2/categories/${categoryId}`,
        method: 'PATCH',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Delete a category. It will be removed from all permission and roles.
     *
     * @tags Categories
     * @name CategoriesDelete
     * @request DELETE:/v2/categories/{categoryId}
     */
    categoriesDelete: (categoryId: string, params: RequestParams = {}) =>
      this.request<void, ErrorResponse>({
        path: `/v2/categories/${categoryId}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * @description Create a scope type
     *
     * @tags Scope Types
     * @name ScopeTypesCreate
     * @request POST:/v2/scope_types
     */
    scopeTypesCreate: (data: ScopeTypeCreateRequest, params: RequestParams = {}) =>
      this.request<ScopeTypeCreateResponse, ErrorResponse>({
        path: `/v2/scope_types`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get scope types
     *
     * @tags Scope Types
     * @name ScopeTypesList
     * @request GET:/v2/scope_types
     */
    scopeTypesList: (params: RequestParams = {}) =>
      this.request<ScopeTypeCreateResponse[], ErrorResponse>({
        path: `/v2/scope_types`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * @description Get details of a scopeType
     *
     * @tags Scope Types
     * @name ScopeTypesDetail
     * @request GET:/v2/scope_types/{scopeType}
     */
    scopeTypesDetail: (scopeType: ScopeType, params: RequestParams = {}) =>
      this.request<ScopeTypeCreateResponse, ErrorResponse>({
        path: `/v2/scope_types/${scopeType}`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * @description Update the description of the scope type
     *
     * @tags Scope Types
     * @name ScopeTypesPartialUpdate
     * @request PATCH:/v2/scope_types/{scopeType}
     */
    scopeTypesPartialUpdate: (
      scopeType: ScopeType,
      data: {
        /** @example "Description of scope type" */
        description: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<ScopeTypeCreateResponse, ErrorResponse>({
        path: `/v2/scope_types/${scopeType}`,
        method: 'PATCH',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get roles assigned to users.
     *
     * @tags Users
     * @name UsersRolesList
     * @request GET:/v2/users/roles
     */
    usersRolesList: (
      query?: {
        /**
         * Get roles that are assigned to all the supplied users. The items are comma separated and is an OR filter.
         * @minItems 1
         */
        userIds?: string[];
        /**
         * Get users who have all the supplied roles assigned. The items are comma separated and is an OR filter.
         * @example ["cb94a125-f59d-4f7e-a0dc-111cc2643803,f958913c-27a7-44c4-a190-714e9d43fd29"]
         */
        roleIds?: string;
        /**
         * Filter assignments that are created by specified user
         * @format uuid
         * @example "d8db4e13-570b-4b35-8249-bb25d4482bec"
         */
        createdBy?: string;
        /**
         * Filter roles that are assigned on/after the supplied date
         * @format date
         * @example "2023-03-15"
         */
        createdFrom?: string;
        /**
         * Filter roles that are assigned on/before the supplied date
         * @format date
         * @example "2023-03-30"
         */
        createdTo?: string;
        /** Get roles that are assigned for specified scopeType */
        scopeType?: ScopeType;
        /**
         * Get roles that are assigned for specified scopeValue
         * @example "25230fc1-e7af-40ba-b2fc-dd94d7dfe9aa"
         */
        scopeValue?: string;
        /**
         * Give information about the page number
         * @example "0"
         */
        page?: number;
        /**
         * Give information for number of items to get in one request
         * @example "0"
         */
        size?: number;
        /**
         * sort the required data
         * @example "name,desc"
         */
        sort?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<PaginatedUserRolesResponse, ErrorResponse>({
        path: `/v2/users/roles`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * @description Assigns roles to a user with scope specified in the body
     *
     * @tags Users
     * @name UsersRolesCreate
     * @request POST:/v2/users/{userId}/roles
     */
    usersRolesCreate: (
      userId: string,
      data: {
        /**
         * @format uuid
         * @example "0a0c7112-0a56-4d68-ae0d-fb915bf5b59b"
         */
        roleId: string;
        /** @example "Reason for providing access" */
        comments?: string;
        /** Supported scope types */
        scopeType: ScopeType;
        /** @example "fa094b3b-d3f6-466e-943f-859dbfdd36e2" */
        scopeValue: string;
      }[],
      params: RequestParams = {},
    ) =>
      this.request<UserRolesCreateResponse[], ErrorResponse>({
        path: `/v2/users/${userId}/roles`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Unassign all roles assigned to a user
     *
     * @tags Users
     * @name UsersRolesDelete
     * @request DELETE:/v2/users/{userId}/roles
     */
    usersRolesDelete: (userId: string, params: RequestParams = {}) =>
      this.request<void, ErrorResponse>({
        path: `/v2/users/${userId}/roles`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * @description Delete a role assigned to a user with specific scopes. **ScopeValue is passed in the query param.** Only GLOBAL scopeType do not have scopeValue assigned to it.
     *
     * @tags Users
     * @name UsersRolesDelete2
     * @request DELETE:/v2/users/{userId}/roles/{roleId}/{scopeType}
     * @originalName usersRolesDelete
     * @duplicate
     */
    usersRolesDelete2: (
      roleId: string,
      userId: string,
      scopeType: ScopeType,
      query?: {
        /**
         * scopeValue. Since, global scopeTypes do not have a associated scopeValue.
         * @example "6f78c8c3-a24a-4209-84c9-1b48f5c1fe9a"
         */
        scopeValue?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, ErrorResponse>({
        path: `/v2/users/${userId}/roles/${roleId}/${scopeType}`,
        method: 'DELETE',
        query: query,
        ...params,
      }),

    /**
     * @description Get permissions assigned to the user
     *
     * @tags Users
     * @name UsersPermissionsDetail
     * @request GET:/v2/users/{userId}/permissions
     */
    usersPermissionsDetail: (
      userId: string,
      query?: {
        /** Filter permissions matching supplied scopeType */
        scopeType?: ScopeType;
        /**
         * Filter permissions for the scopeValue - the resource id against which permission needs to check. For MERCHANT scopeType, this should be set to merchantId. Mandatory is scopeType is not GLOBAL.
         * @example "efa7f0ff-890e-478f-ae5d-7ce12cb96df9"
         */
        scopeValue?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<UserPermissionsResponse[], ErrorResponse>({
        path: `/v2/users/${userId}/permissions`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * @description Check if a users has specific permission for the specified resource - A combination of scopeType and scopeValue
     *
     * @tags Users
     * @name UsersPermissionsCheckDetail
     * @request GET:/v2/users/{userId}/permissions/check
     */
    usersPermissionsCheckDetail: (
      userId: string,
      query: {
        /** Filter permissions matching supplied scopeType */
        scopeType: ScopeType;
        /**
         * The resource id against which permission needs to check. For MERCHANT scopeType, this should be set to merchantId
         * @example "efa7f0ff-890e-478f-ae5d-7ce12cb96df9"
         */
        scopeValue?: string;
        /**
         * The permission to check
         * @example "USER:PROFILE:CREATE"
         */
        permission: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          hasPermission: boolean;
        },
        ErrorResponse
      >({
        path: `/v2/users/${userId}/permissions/check`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get audit logs
     *
     * @tags Audit Logs
     * @name AuditList
     * @request GET:/v2/audit
     */
    auditList: (
      query: {
        /**
         * role Id
         * @format uuid
         * @example "9bc235cd-21e1-4db7-9ede-9d6a40a3d93b"
         */
        roleId?: string;
        /**
         * permission Id
         * @format uuid
         * @example "9bc235cd-21e1-4db7-9ede-9d6a40a3d93b"
         */
        permissionId?: string;
        /**
         * User Id
         * @format uuid
         * @example "9bc235cd-21e1-4db7-9ede-9d6a40a3d93b"
         */
        userId?: string;
        /**
         * Affected User Id
         * @format uuid
         * @example "9bc235cd-21e1-4db7-9ede-9d6a40a3d93b"
         */
        affectedUserId?: string;
        /**
         * Filter audit logs created on/after the supplied date
         * @format date
         * @example "2023-03-15"
         */
        createdFrom?: string;
        /**
         * Filter audit logs created on/before the supplied date
         * @format date
         * @example "2023-03-30"
         */
        createdTo?: string;
        /**
         * Give information about the page number
         * @example "1"
         */
        page?: number;
        /**
         * Give information for number of items to get in one request
         * @example "1"
         */
        size?: number;
        /**
         * Give information about the type of audit log history
         * @example "roles"
         */
        type: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<PaginatedAuditResponse, ErrorResponse>({
        path: `/v2/audit`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),
  };
}
