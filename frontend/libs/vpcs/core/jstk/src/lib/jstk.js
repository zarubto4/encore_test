import fetch from 'node-fetch';
import baseConvert from './baseconv';
import { createRequire } from 'module';
import path from 'node:path';

const O = {
  O: class extends Object {
    static get obj() {
      return new this();
    }
    get keys() {
      return O.O.keys(this);
    }
    accepts(k) {
      hasOwnProperty(k);
    }
  },
  S: class extends String {
    radix(r1, r2) {
      return baseConvert(this, r1, r2).toString();
    }
    static get asc() {
      return this.charCodeAt(0);
    }
  },
  A: class extends Array {},
  N: class extends Number {
    chr() {
      String.fromCharCode(this);
    }
  },
};
O.alias = (target, shortname, longname) => {
  O[shortname] = (..._) => {
    const tgt = O.accepts(target) ? O.target : _.shift();
    return tgt.send(longname, ..._);
  };
};
O.v = (_) => O.accepts(_.constructor.name[0]);
O.up = (_) => (O.v(_) ? new O[_.constructor.name[0]](_) : _);
O.get = async (..._) => await fetch(..._);

// this ugly behavior is how base react detects backend; next has the more sophisticated loadEnvConfig
O.backend = () => {
  if (process.env.VPCS) return true; // NextJS nonpublic
  return typeof window === 'undefined';
};
O.client = () => {
  if (process.env.VPCS) return true; // NextJS nonpublic
  return typeof window !== 'undefined';
};

if (O.client()) {
  O.d = window.document;
  O.w = window;
  O.qsa = (_) => O.A.from(O.d.querySelectorAll(_));
  O.qs = (_) => O.d.querySelector(_);
} else {
  // this is a great example of something we could make client/server
  O.loadConfig = createRequire(path.resolve(import.meta.url));
}

const jstk = O;
export { jstk };
