import { VPCSNextJS } from './vpcs-nextjs';
type MacroDirective = ['env' | 'function', string | ((arg0: VPCSNextJSTypecast) => unknown)];
type VPCSMacro = { _macro: MacroDirective };
type KeyValueStore = {
  [property: string]:
    | string
    | null
    | undefined
    | number
    | RegExp
    | boolean
    | VPCSMacro
    | KeyValueStore
    | string[]
    | KeyValueStore[];
};
type VPCSFeatureConfig = { [feature_name: string]: KeyValueStore };
type VPCSNextConfig = { public: VPCSFeatureConfig; server: VPCSFeatureConfig };
interface VPCSNextJSTypecast {
  constructor: (featureName: string) => void;
  env: VPCSFeatureConfig;
  globals: VPCSFeatureConfig;
  appConfig: VPCSNextConfig;
  featureConfig: VPCSNextConfig;
  config: VPCSNextConfig;
  unifiedFeatureConfig: VPCSNextConfig;
  projectName: string;
}
export { VPCSNextJS, type VPCSFeatureConfig, type VPCSMacro, type VPCSNextConfig, type VPCSNextJSTypecast };
