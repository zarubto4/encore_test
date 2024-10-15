import { VPCSNextLogger, grpnNextLoggingFeature, stenoFormatter } from './core-logger';
import { ReadableStream } from 'stream/web';
import { NextApiRequest } from 'next';
import { Environment2Steno, isEnvironment, StenoLogLevel, StenoSchema, Steno2Priority } from './constants';
import { VPCSEnvironment } from '@vpcs/vpcs-nextjs';
// Serverside logging functionality: server log function and nextjs api endpoint helpers
import * as Winston from 'winston';

function stenoLogger(transports: Winston.transport[] = []): Winston.Logger {
  return Winston.createLogger({
    exitOnError: false,
    format: stenoFormatter,
    levels: Steno2Priority,
    transports: transports,
  });
}

const logLevel: () => StenoLogLevel = () => {
  let key: keyof typeof Environment2Steno =
    grpnNextLoggingFeature.config.environment ??
    (grpnNextLoggingFeature.globals.environment as VPCSEnvironment) ??
    'local';
  if (!isEnvironment(key)) key = 'local';
  if (Object.keys(Environment2Steno).includes(key)) {
    return Environment2Steno[key];
  } else {
    return 'debug' as StenoLogLevel;
  }
};

class VPCSNextServerLogger extends VPCSNextLogger {
  receive(obj: Partial<StenoSchema>): this {
    this.steno.populate(obj);
    return this;
  }
  override _createLogger(): Winston.Logger {
    return stenoLogger(this._transports());
  }
  _transports() {
    return [
      new Winston.transports.File({
        filename: '../../logs/steno.log',
        level: logLevel(),
        maxsize: 250 * 1024 * 1024,
        maxFiles: 30,
      }),
      new Winston.transports.Console({
        level: logLevel(),
      }),
    ];
  }
}

const log = (message?: string) => {
  const lgr = new VPCSNextServerLogger();
  if (typeof message == 'string') lgr.content(message);
  return lgr;
};
const parseBody = (request: NextApiRequest): object => {
  return (request.body as ReadableStream)
    .getReader()
    .read()
    .then((r) => r.value)
    .then((v) => JSON.parse(v as string));
};

const server = { log, VPCSNextServerLogger, parseBody };
export { server };
