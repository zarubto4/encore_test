import { VPCSNextJS } from '@vpcs/vpcs-nextjs';
import { UUID, randomUUID } from 'crypto';

// Configuration
type VPCSGrouponSuboptimalFeatureConfig = {
  apiEndpoint?: string;
  trackyLogFileName: string;
  trackyLogFilePath: string;
  events: {
    bloodhound?: boolean;
    standard?: boolean;
    custom?: boolean;
    performance?: boolean;
  };
};
type VPCSGrouponSuboptimalConfig = {
  'grpn-suboptimal': VPCSGrouponSuboptimalFeatureConfig;
};
const suboptimal = new VPCSNextJS('grpn-suboptimal');
const suboptimalConfig = suboptimal.config as VPCSGrouponSuboptimalConfig;
const trackyLogConfig = {
  name: suboptimalConfig['grpn-suboptimal'].trackyLogFileName,
  path: suboptimalConfig['grpn-suboptimal'].trackyLogFilePath,
};
if (!trackyLogConfig.path.startsWith('/')) {
  trackyLogConfig.path = `../../${trackyLogConfig.path}`;
}

// Tracky Types
type TrackySimpleType = string | number | boolean | null;
type TrackyComplexType =
  | TrackySimpleType
  | TrackySimpleType[]
  | Record<string, TrackySimpleType>
  | Record<string, TrackySimpleType>[];
type TrackyType =
  | Record<string, TrackyComplexType>
  | TrackyComplexType[]
  | TrackyComplexType
  | Record<string, TrackyComplexType[]>
  | Record<string, TrackyComplexType>[];

type GRPNTrackyBase = {
  event_id: UUID;
  event_name: string;
  event_time: string;
};
type GRPNTracky = GRPNTrackyBase & TrackyType;

class Tracky {
  _: Partial<GRPNTracky>;
  constructor() {
    this._ = this._generateBase();
  }

  _generateBase() {
    return {
      event_id: randomUUID(),
      event_name: 'anonymous_event',
      event_time: new Date().toISOString(),
    };
  }

  data(obj: object) {
    this._ = { ...this._, ...obj };
    return this;
  }

  event(name: string) {
    this._.event_name = name;
    return this;
  }

  get content() {
    return this._;
  }
}

export { suboptimal, suboptimalConfig, trackyLogConfig, Tracky, TrackyType, GRPNTracky };
