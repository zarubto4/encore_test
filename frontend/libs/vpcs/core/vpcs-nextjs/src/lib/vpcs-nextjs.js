/*
  Core libraries for working with NextJS; this will be the abstraction interface, as opposed to dependency injection
*/

import getConfig from 'next/config';

class VPCSNextJS {
  constructor(featurename) {
    this.feature_name = featurename;
  }

  get appConfig() {
    const { serverRuntimeConfig, publicRuntimeConfig } = getConfig();
    return {
      server: serverRuntimeConfig?.vpcs ?? {},
      public: publicRuntimeConfig.vpcs ?? {},
    };
  }

  get globals() {
    return this.appConfig.public._globals;
  }

  get featureConfig() {
    return { ...this.server, ...this.client };
  }

  get server() {
    return this.appConfig.server[this.feature_name] ?? {};
  }

  get client() {
    return this.appConfig.public[this.feature_name] ?? {};
  }

  get config() {
    return this.parseConfigMacros(this.featureConfig);
  }

  get env() {
    return process?.env ?? this.globals;
  }

  get projectName() {
    return this.globals?.name ?? 'unknown';
  }

  parseConfigMacros(parseable) {
    const parseable_type = parseable.constructor.name;
    if (parseable_type === 'Array') {
      return parseable.map((_) => this.parseConfigMacros(_));
    } else if (parseable_type === 'Object') {
      if (
        Object.keys(parseable).includes('_macro') &&
        parseable._macro.constructor.name === 'Array' &&
        parseable._macro.length == 2
      ) {
        // handle macro behavior. macros include a definition and a management object.
        // for instance, _macro: [ 'env', 'NEXT_PUBLIC_API_ENV' ]
        const [command, definition] = parseable._macro;
        switch (command) {
          case 'lambda': {
            if (typeof definition !== 'function') return null;
            return definition('function');
          }
          case 'env': {
            return this.env[definition] ?? undefined;
          }
          default: {
            return null;
          }
        }
      } else {
        const retval = {};
        Object.keys(parseable).forEach((k) => {
          retval[k] = this.parseConfigMacros(parseable[k]);
        });
        return retval;
      }
    } else {
      return parseable;
    }
  }
}

export { VPCSNextJS };
