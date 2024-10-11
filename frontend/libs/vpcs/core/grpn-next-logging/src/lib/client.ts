'use client';
import { GRPNNextLoggingFeatureConfig } from './constants';
// Client only logging interface - same logging behavior, client-flavored response
// This feature should generate steno log objects and write them to server.
// We should also build in a way that promotes batching/etc in the future
import { grpnNextLoggingFeature, VPCSNextLogger, VPCSLogger, VPCSLogMethod, StenoWinstonShim } from './core-logger';
type GrpnNextClientLoggingGlobals = Record<'apiHost' | 'environment', string>;
// create a client logger that sends logs to the server at the endpoint specified in grpnNextLoggingFeature.config.serverEndpoint
class ClientLogger implements VPCSLogger {
  uri: string;
  env: GrpnNextClientLoggingGlobals;
  config: GRPNNextLoggingFeatureConfig;

  constructor() {
    this.env = grpnNextLoggingFeature.globals;
    this.config = grpnNextLoggingFeature.client;
    this.uri = [this.env.apiHost, this.config.serverEndpoint].join('');
  }

  logToBrowser(shim: StenoWinstonShim): void {
    console.log(shim.steno);
  }

  log: VPCSLogMethod = async (shim: StenoWinstonShim) => {
    // send message json object to server as a post request with steno in the body
    // maybe we should make this a batch request in the future, and possibly debounce / secure it
    if (['fatal', 'crit', 'warn', 'error'].includes(shim.steno.level)) this.logToBrowser(shim); // MBNXT-4533
    try {
      const endpoint = this.uri;
      return await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shim.steno),
      }).then((response) => {
        console.log({ response: { status: response.status, statusText: response.statusText } });
        return Promise.resolve(response);
      });
    } catch (error) {
      let stackTrace: string[] = [];
      if (typeof error === 'object' && typeof (error as TypeError).stack === 'string') {
        stackTrace = ((error as TypeError).stack as string).split('\n');
      }
      console.log({ error, stackTrace });
      const response = new Response();
      return Promise.resolve(response);
    }
  };
}

class VPCSClientLogger extends VPCSNextLogger {
  // this logger just sends steno objects to the server
  // it should be used in the client only
  constructor() {
    super();
  }
  override _createLogger(): VPCSLogger {
    return new ClientLogger();
  }
}

function log(message?: string) {
  const logr = new VPCSClientLogger();
  if (message) logr.content(message);
  return logr;
}
const client = { log, VPCSClientLogger };
export { client };
