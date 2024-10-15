import { VPCSNextJS } from '@vpcs/vpcs-nextjs';
import type { VPCSFeatureConfig } from '@vpcs/vpcs-nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import * as Base64 from 'base-64';
import geoip = require('fast-geoip');

const builtins = ['geolocation'];
type BuiltinType =
  | (typeof builtins)[number]
  | ((req: NextRequest, resp: NextResponse, ra: ResponseAction) => void | NextResponse);
type VPCSNextRHCResponder = { content: string; status: number; action: 'halt' | 'respond' };
type VPCSNextRHCSetCookie = {
  name: string;
  value?: string;
  path?: string;
  action: 'set-cookie';
  builtin?: BuiltinType;
};
type VPCSNextRHCRedirector = { url: string; action: 'redirect' };
type VPCSNextRHCSetRequestHeader = { content?: string; name: string; action: 'set-header'; builtin?: BuiltinType };
type VPCSNextRHCRewrite = { url: string; match: RegExp; action: 'rewrite' };
type ResponseAction =
  | VPCSNextRHCRewrite
  | VPCSNextRHCRedirector
  | VPCSNextRHCSetCookie
  | VPCSNextRHCResponder
  | VPCSNextRHCSetRequestHeader;
const isGenericVPCSResponderType = (ra: ResponseAction, ...actions: Array<string>): ra is ResponseAction =>
  ra && typeof ra === 'object' && actions.includes(ra.action);
const isResponder = (ra: ResponseAction): ra is VPCSNextRHCResponder =>
  isGenericVPCSResponderType(ra, 'halt', 'respond');
const isSetCookie = (ra: ResponseAction): ra is VPCSNextRHCSetCookie => isGenericVPCSResponderType(ra, 'set-cookie');
const isRedirect = (ra: ResponseAction): ra is VPCSNextRHCRedirector => isGenericVPCSResponderType(ra, 'redirect');
const isSetRequest = (ra: ResponseAction): ra is VPCSNextRHCSetRequestHeader =>
  isGenericVPCSResponderType(ra, 'set-header');
const isRewrite = (ra: ResponseAction): ra is VPCSNextRHCRewrite =>
  isGenericVPCSResponderType(ra, 'rewrite') &&
  Object.keys(ra).includes('match') &&
  (ra as VPCSNextRHCRewrite).match.constructor.name === 'RegExp';
type RequestHandlerConfig = { response: ResponseAction[] };
type VPCSRequestHandlerListConfig = { handlers: { [key: string]: RequestHandlerConfig } };

type GrouponRequestMiddlewareConfig = {
  'grpn-request-middleware': VPCSRequestHandlerListConfig;
};

const middlewareHandlers = ['akamai-bot-detection'];
const routingHandlers = ['geolocation'];

const vpcs = new VPCSNextJS('grpn-request-middleware');
const handlerFor = (handlertitle: string): RequestHandlerConfig =>
  vpcs.config.handlers?.[handlertitle] ?? { response: [] };

type BuiltInHandlerDictionary = {
  [key: (typeof builtins)[number]]: (request: NextRequest, response: NextResponse, ra: ResponseAction) => void;
};

const builtinHandlers: BuiltInHandlerDictionary = {
  geolocation: (request: NextRequest, response: NextResponse, ra: ResponseAction): void => {
    geoip.lookup(request.headers.get('x-forwarded-for') ?? '127.0.0.1').then((geo) => {
      const geolocation = JSON.stringify(geo);
      switch (ra.action) {
        case 'set-cookie':
          return cookies().set(ra.name, geolocation);
        case 'set-header':
          return response.headers.set(ra.name, geolocation);
        case 'respond':
          return NextResponse.json({ geolocation });
        case 'halt':
          return NextResponse.json({ geolocation });
        default:
          return;
      }
    });
  },
};

const middlewareHandler = (request: NextRequest, response?: NextResponse): NextResponse | void => {
  middlewareHandlers.forEach((handler) => {
    handlerFor(handler).response.forEach((ra: ResponseAction): NextResponse | void => {
      if (isRedirect(ra)) {
        response = NextResponse.redirect(new URL(ra.url, request.url));
      } else if (isRewrite(ra)) {
        if (ra.match.exec(request.url)) {
          response = NextResponse.rewrite(new URL(ra.url, request.url));
        }
      } // other actions go in handlers
    });
  });
  return response;
};
const ditto = () => undefined;
const builtinFunctionManager = (
  request: NextRequest,
  response: NextResponse,
  ra: VPCSNextRHCSetRequestHeader | VPCSNextRHCSetCookie,
): NextResponse | void => {
  response ||= NextResponse.next();
  if (typeof ra.builtin === 'function') return (ra.builtin ?? ditto)(request, response, ra);
  if (typeof ra.builtin === 'string') return (builtinHandlers[ra.builtin] ?? ditto)(request, response, ra);
};

const routesHandler = (request: NextRequest, response?: NextResponse): NextResponse | void => {
  if (!response) response = NextResponse.next();
  routingHandlers.forEach((handler) => {
    const handlers = handlerFor(handler).response;
    handlers.forEach((ra: ResponseAction): NextResponse | NextRequest | void => {
      if (isResponder(ra)) {
        response = NextResponse.json({ message: ra.content }, { status: ra.status });
        return response;
      } else if (isSetCookie(ra)) {
        response ||= NextResponse.next();
        if (ra.builtin) return builtinFunctionManager(request, response, ra);
        cookies().set(ra.name, ra.value ?? '');
      }
    });
    return response;
  });
};

type MiddlewareFunction = (request: NextRequest, response: NextResponse) => NextResponse | NextRequest | void;
type MiddlewareDictionary = {
  [key: string]: (request: NextRequest, response: NextResponse) => MiddlewareFunction | void;
};
type TestFunction = (request: NextRequest, configuration?: RequestHandlerConfig) => boolean;
type TestDictionary = { [key: string]: TestFunction };
const middleware: MiddlewareDictionary = {};
const serverActions: MiddlewareDictionary = {};
const middlewareForger = (
  handlerKey: string,
  request: NextRequest,
  testFunction: TestFunction,
  outputType: 'middleware' | 'router',
): MiddlewareFunction | void => {
  if (testFunction(request))
    return (request: NextRequest, response: NextResponse) => {
      outputType === 'middleware' ? middlewareHandler(request) : routesHandler(request, response);
    };
};

const isBot = (request: NextRequest): boolean => {
  const akbotHeader = request.headers.get('g-akbot-botnet-id');
  if (typeof akbotHeader !== 'string') return false;
  return akbotHeader.length > 0;
};

class UserIdentifier {
  requestData: NextRequest;
  cookies: ReadonlyRequestCookies;
  constructor(request: NextRequest) {
    this.requestData = request;
    this.cookies = cookies();
  }
  get userId() {
    return (this.cookies.get('c') ?? '') as string;
  }
  get browserId() {
    return (this.cookies.get('b') ?? '') as string;
  }
  get isBot() {
    return isBot(this.requestData);
  }
  get macaroon() {
    return (this.cookies.get('macaroon') ?? '') as string;
  }
  get decodedMacaroon() {
    if (!(this.macaroon && this.macaroon.length > 0)) return {};
    const decoded = Base64.decode(this.macaroon);
    try {
      return JSON.parse(decoded);
    } catch (e) {
      return {};
    }
  }
}

const userIdentifier = (request: NextRequest): UserIdentifier => {
  return new UserIdentifier(request);
};

const testCases: TestDictionary = {
  'akamai-bot-detection': isBot,
};

Object.keys(testCases).forEach((handler) => {
  middleware[handler] = (request) => middlewareForger(handler, request, testCases[handler], 'middleware');
  serverActions[handler] = (request) => middlewareForger(handler, request, testCases[handler], 'router');
});

const configHandlers = middlewareHandlers.concat(routingHandlers);
const middlewareInjector = (request: NextRequest, response?: NextResponse): NextResponse | NextRequest | void => {
  middlewareHandlers.forEach((handler) => {
    const middlewareResult = middleware[handler](request, response || NextResponse.next());
    if (middlewareResult instanceof NextResponse) response = middlewareResult;
  });
  return response;
};
const routerInjector = (request: NextRequest, response?: NextResponse): NextResponse | void => {
  routingHandlers.forEach((handler) => {
    const routerResult = serverActions[handler](request, response || NextResponse.next());
    if (routerResult instanceof NextResponse) response = routerResult;
  });
  return response;
};

export {
  routerInjector,
  middlewareInjector,
  userIdentifier,
  isGenericVPCSResponderType,
  isRedirect,
  isResponder,
  isRewrite,
  isSetCookie,
  isSetRequest,
  builtins,
  middleware,
  serverActions,
  testCases,
  configHandlers,
  routingHandlers,
  middlewareHandlers,
  VPCSRequestHandlerListConfig,
  VPCSFeatureConfig,
  RequestHandlerConfig,
  VPCSNextRHCRedirector,
  VPCSNextRHCResponder,
  VPCSNextRHCRewrite,
  VPCSNextRHCSetCookie,
  VPCSNextRHCSetRequestHeader,
  GrouponRequestMiddlewareConfig,
  UserIdentifier,
};
