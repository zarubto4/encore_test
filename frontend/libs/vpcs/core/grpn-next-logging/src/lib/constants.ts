import { VPCSEnvironment, isEnvironment, TypeGuard } from '@vpcs/vpcs-nextjs';
type WinstonLogLevel = 'emerg' | 'alert' | 'crit' | 'error' | 'warning' | 'notice' | 'info' | 'debug';
type StenoLogLevel = 'unknown' | 'fatal' | 'crit' | 'warn' | 'info' | 'debug';
type LogPriorityMappingType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
type LogMappable = WinstonLogLevel | StenoLogLevel | LogPriorityMappingType | VPCSEnvironment;
type PM = WinstonLogLevel | StenoLogLevel | VPCSEnvironment;
type PriorityLogLevelMappingArray = [PM, PM, PM, PM, PM, PM, PM, PM];
// definitions
interface LogLevelInterface {
  Winston: LogMappable[];
  Steno: LogMappable[];
}
const LogLevels: LogLevelInterface = {
  Winston: ['emerg', 'alert', 'crit', 'error', 'warning', 'notice', 'info', 'debug'],
  Steno: ['unknown', 'fatal', 'crit', 'warn', 'info', 'debug'],
};

const Steno2Winston: Record<StenoLogLevel, WinstonLogLevel> = {
  unknown: 'notice',
  fatal: 'emerg',
  crit: 'crit',
  warn: 'warning',
  info: 'info',
  debug: 'debug',
};
const Steno2Priority: Record<StenoLogLevel, LogPriorityMappingType> = {
  debug: 7,
  info: 7,
  warn: 4,
  crit: 2,
  fatal: 1,
  unknown: 5,
};
const Winston2Steno: Record<WinstonLogLevel, StenoLogLevel> = {
  emerg: 'fatal',
  alert: 'fatal',
  crit: 'crit',
  error: 'crit',
  warning: 'warn',
  debug: 'debug',
  info: 'info',
  notice: 'warn',
};
const Priority2Steno: PriorityLogLevelMappingArray = [
  'fatal',
  'fatal',
  'crit',
  'crit',
  'warn',
  'info',
  'info',
  'debug',
];
const Environment2Steno: Record<VPCSEnvironment, StenoLogLevel> = {
  development: 'debug',
  ci: 'debug',
  staging: 'info',
  catfood: 'warn',
  production: 'warn',
  local: 'debug',
};
const Environment2Winston: Record<VPCSEnvironment, WinstonLogLevel> = {
  development: 'debug',
  ci: 'debug',
  staging: 'info',
  catfood: 'notice',
  production: 'notice',
  local: 'debug',
};

const isWinstonLogLevel: TypeGuard = (level: unknown): level is WinstonLogLevel =>
  LogLevels.Winston.includes(level as string as WinstonLogLevel);
const isStenoLogLevel: TypeGuard = (level: unknown): level is StenoLogLevel =>
  LogLevels.Steno.includes(level as string as StenoLogLevel);
const isPriority: TypeGuard = (level: unknown): level is LogPriorityMappingType => {
  if (!(level && typeof level === 'number')) return false;
  return level >= 0 && level < 8;
};
const winston2steno: (o: WinstonLogLevel) => StenoLogLevel = (o) =>
  isWinstonLogLevel(o) ? Winston2Steno[o] : 'unknown';
const steno2winston: (o: StenoLogLevel) => WinstonLogLevel = (o) => (isStenoLogLevel(o) ? Steno2Winston[o] : 'info');

interface GRPNNextLoggingFeatureConfig {
  level?: StenoLogLevel | WinstonLogLevel;
  serverEndpoint: string;
  strict?: 'true' | 'false';
}
type ISOTimestamp = Exclude<string, ''>; // 2021-09-29T15:00:00.000Z
type StenoKVDataFieldType = string | number | null | boolean | undefined | string[];
type StenoExpandedValueType =
  | StenoKVDataFieldType
  | Record<string, StenoKVDataFieldType>
  | Record<string, StenoKVDataFieldType[]>;
type StenoNameKeyType = Exclude<string, 'body' | '_body'>;
type StenoKVRecordType = Record<StenoNameKeyType, StenoExpandedValueType>;
type StenoContext = Record<
  'file' | 'line' | 'method' | 'class' | 'namespace' | 'threadid' | 'processid' | 'host',
  string
>;
interface StenoExceptionInterface {
  type: string;
  message: string;
  backtrace?: string[];
  data?: StenoKVRecordType;
  stack?: string[] | string;
}
type StenoNameType = Exclude<string, 'body' | '_body'>;
interface StenoSchema {
  name: string; // no spaces
  time: string; // iso timestamp zulu
  level: StenoLogLevel;
  data?: StenoKVRecordType;
  exception?: StenoExceptionInterface;
  context?: StenoContext;
  id?: string; // unique identifier
  version: number | '0';
}
interface ErrorLikeObject extends Record<string | symbol, undefined | string | StenoKVRecordType | string[]> {
  name?: string;
  message: string;
  stack?: string | string[];
  __proto__?: { __proto__?: { name: string } };
}
const proto = Object.getPrototypeOf;

const isError: TypeGuard = (o: unknown): o is Error => {
  if (typeof o !== 'object') return false;
  if (o?.constructor?.name === 'Error') return true;
  const oo: ErrorLikeObject = o as ErrorLikeObject;
  if (proto(proto(oo)).name === 'Error') return true;
  if (typeof oo.message === 'string' && (typeof oo.name === 'string' || oo.constructor?.name === 'string')) return true;
  return false;
};

const error2StenoException = (o: Error | ErrorLikeObject): StenoExceptionInterface => {
  if (!isError(o)) throw new Error('Invalid error object!');
  return {
    message: o?.message,
    type: o?.name ?? o?.constructor?.name ?? 'UnknownError',
    stack: typeof o.stack === 'string' ? o.stack.split('\n') : o.stack,
  };
};

const isISOTimestamp: TypeGuard = (o: unknown): o is ISOTimestamp =>
  typeof o === 'string' && /^\d{4}-\d{2}-\d{2}-T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})Z$/.exec(o) !== null;
const isStenoLogName: TypeGuard = (o: unknown): o is StenoNameType => typeof o === 'string' && /^\S+$/.exec(o) !== null;
const validStenoDataKey: TypeGuard = (o: unknown): o is StenoNameKeyType =>
  typeof o === 'string' && !['body', '_body'].includes(o);

class Steno {
  steno: Partial<StenoSchema>;
  app_name: string;
  constructor(app_name: string | undefined) {
    this.app_name = app_name ?? 'anonymous-service';
    this.steno = { version: '0', time: new Date().toISOString(), name: [app_name, 'message'].join('.') };
  }

  _setLevel(o: WinstonLogLevel | StenoLogLevel): this | void {
    if (!isStenoLogLevel(o)) {
      if (isWinstonLogLevel(o)) {
        o = winston2steno(o as WinstonLogLevel);
      } else {
        throw new Error(`Invalid log level ${o}`);
      }
    }
    this.steno.level = o as StenoLogLevel;
    return this;
  }

  info() {
    return this._setLevel('info');
  }
  unknown() {
    return this._setLevel('unknown');
  }
  fatal() {
    return this._setLevel('fatal');
  }
  crit() {
    return this._setLevel('crit');
  }
  warn() {
    return this._setLevel('warn');
  }
  debug() {
    return this._setLevel('debug');
  }
  error() {
    return this._setLevel('crit');
  }

  exception(obj: Error | ErrorLikeObject, additionalData?: Partial<StenoExceptionInterface>) {
    additionalData ||= {};
    this.steno.exception = { ...additionalData, ...error2StenoException(obj) };
    return this;
  }

  message(s: string) {
    // set as name if valid
    if (isStenoLogName(s)) {
      this.steno.name = s;
    } else {
      this.steno.data ||= {};
      this.steno.data['message'] = s;
    }
    return this;
  }

  name(s: string) {
    return this.message(s);
  } // this might not be the best behavior, as names with spaces will go to data.message
  data(ss: StenoKVRecordType) {
    if (!this.steno.data) this.steno.data = {};
    this.steno.data = { ...this.steno.data, ...ss };
    return this;
  }

  finalize() {
    this.steno.time = new Date().toISOString();

    return this;
  }
  _steno2priority() {
    if (!this.steno.level) return 99;
    return Steno2Priority[this.steno.level];
  }

  isValid(): boolean {
    const validation = this.validation();
    return !!Object.keys(validation).reduce((s, i) => validation[i] && s, true);
  }

  dummy() {
    // fixes data with dummy values
    const validation = this.validation();
    Object.keys(validation).forEach((k) => {
      if (validation[k] === false) {
        // @ts-expect-error dynamic typechecking
        (this[`__fix_${k}`] as (() => void) | undefined)?.();
      }
    });
    return this;
  }
  __fix_name() {
    this.steno.name = this.steno.name?.replace(/\s+/g, '') ?? [this.app_name, 'message'].join('.');
  }
  __fix_time() {
    this.steno.time = new Date().toISOString();
  }
  __fix_level() {
    this.info()?.squawk('Autoset invalid level to -info-');
  }
  __fix_data() {
    if (typeof this.steno.data !== 'object') return;
    Object.keys(this.steno.data).forEach((k) => {
      const ok: string = k;
      while (!validStenoDataKey(k)) {
        k = `${k}_`;
      }
      if (k !== ok) {
        (this.steno.data as Record<string, unknown>)[k] = this.steno.data?.[ok];
        delete (this.steno.data as Record<string, unknown>)[ok];
      }
    });
  }

  squawk_name = 'grpn-next-logger-squawk';
  squawk(message: string) {
    this.steno.data ||= {};
    if (this.steno.data[this.squawk_name]?.constructor?.name !== 'Array') {
      this.steno.data[this.squawk_name] = [];
    }
    (this.steno.data[this.squawk_name] as string[]).push(message);
    return this;
  }
  get level() {
    return this.steno.level;
  }
  validation(): Record<string, boolean> {
    return {
      time: isISOTimestamp(this.steno.time),
      name: isStenoLogName(this.steno.name),
      level: isStenoLogLevel(this.steno.level),
      data: Object.keys(this.steno.data ?? {}).reduce((s, i) => {
        return validStenoDataKey(i) && s;
      }, true),
    };
  }
  populate(newData: Partial<StenoSchema>) {
    this.steno = { ...this.steno, ...newData };
    return this;
  }
  get loggable() {
    return this.finalize().steno as StenoSchema;
  }
}

export { Steno };
export {
  Steno2Priority,
  Steno2Winston,
  Winston2Steno,
  Priority2Steno,
  Environment2Steno,
  Environment2Winston,
  LogLevels,
};
export type {
  StenoLogLevel,
  WinstonLogLevel,
  StenoKVRecordType,
  StenoContext,
  StenoKVDataFieldType,
  StenoExpandedValueType,
};
export { validStenoDataKey, steno2winston, winston2steno, isPriority, isEnvironment, isStenoLogLevel };
export type { GRPNNextLoggingFeatureConfig, StenoSchema, StenoExceptionInterface };
