import { VPCSEnvBlock, VPCSNextJS } from '@vpcs/vpcs-nextjs';
import {
  GRPNNextLoggingFeatureConfig,
  Steno,
  StenoLogLevel,
  steno2winston,
  WinstonLogLevel,
  StenoSchema,
  Steno2Priority,
  StenoKVRecordType,
} from './constants';
import type { TransformableInfo } from 'logform';
import type { Logger, LogMethod } from 'winston';
import * as LogForm from 'logform';

const grpnNextLoggingFeature = new VPCSNextJS('grpn-next-logging');
interface StenoWinstonShim extends TransformableInfo {
  level: WinstonLogLevel;
  steno: StenoSchema;
}

class VPCSLoggerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VPCSLoggerError';
  }
}

const stenoFormatter: LogForm.Format = LogForm.format.combine(
  LogForm.format.uncolorize({ raw: true, message: true, level: true }),
  LogForm.format.printf((info: TransformableInfo) => {
    const shim = info as StenoWinstonShim;
    const { name, time, level, data, exception, context, id, version } = shim.steno;
    const _d: Record<string, unknown> = { data, exception, context, id, version };
    Object.keys(_d).forEach((k) => {
      if (_d?.[k]) {
        _d[k] = JSON.stringify(_d[k]);
      } else {
        delete _d?.[k];
      }
    });
    const insert = Object.keys(_d)
      .map((k) => `"${k}": ${_d[k]}`)
      .join(', ');
    return `{"time": "${time}", "name":"${name}", "level": "${level}", ${insert}}`;
  }),
);

type VPCSLogMethod = (shim: StenoWinstonShim) => Promise<Response | void> | void;
type AbstractMethod = () => void;
type VPCSLogger = { log: VPCSLogMethod | AbstractMethod };
const abstractMethod = () => {
  throw new Error('Abstract method not implemented!');
};
abstract class VPCSNextLogger {
  steno: Steno;
  env: VPCSEnvBlock;
  logger: VPCSLogger | Logger;
  config: GRPNNextLoggingFeatureConfig;

  constructor() {
    this.steno = new Steno(grpnNextLoggingFeature.globals.name);
    this.env = grpnNextLoggingFeature.globals;
    this.logger = this._createLogger();
    this.config = grpnNextLoggingFeature.config;
  }

  _createLogger(): Logger | VPCSLogger {
    return { log: abstractMethod };
  }
  get level() {
    return this.steno.level;
  }
  _lm(l: StenoLogLevel, m: string) {
    (this.steno[l]() as Steno)?.message(m);
    return this;
  }
  get _shim(): StenoWinstonShim {
    if (!this.steno.isValid()) {
      if (this.config.strict === 'true') {
        this.steno
          .exception(new VPCSLoggerError('Invalid log definition with logger value "strict" set to true!'))
          .crit();
        this.steno.steno.time ||= new Date().toISOString();
        this.steno.dummy().squawk('Invalid log definition with logger value "strict" set to true!');
        this.steno.__fix_time();
      } else {
        this.steno.dummy();
      }
    }
    return { steno: this.steno.loggable, message: '', level: steno2winston(this.steno.level as StenoLogLevel) };
  }
  data(obj: StenoKVRecordType) {
    this.steno.data(obj);
    return this;
  }
  content(message: string) {
    this.steno?.message(message);
    return this;
  }
  info(message: string) {
    return this._lm('info', message);
  }
  debug(message: string) {
    return this._lm('debug', message);
  }
  crit(message: string) {
    return this._lm('crit', message);
  }
  warn(message: string) {
    return this._lm('warn', message);
  }
  unknown(message: string) {
    return this._lm('unknown', message);
  }
  fatal(message: string) {
    return this._lm('fatal', message);
  }
  write() {
    (this.logger.log as LogMethod)(this._shim);
    return this;
  }
  valueOf() {
    return Steno2Priority[this.write().level as StenoLogLevel];
  }
}

export { grpnNextLoggingFeature, stenoFormatter };
export { VPCSNextLogger, VPCSLoggerError, type StenoWinstonShim, type VPCSLogMethod, type VPCSLogger };
