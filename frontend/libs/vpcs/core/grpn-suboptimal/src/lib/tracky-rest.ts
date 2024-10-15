// serverside api agent
import 'server-only';
import fetch from 'node-fetch';
import { suboptimal, Tracky } from './constants';
const VERSION = 'itier-next/2024.Q2';

const TrackyEndpoint =
  suboptimal.globals.environment === 'production'
    ? 'https://www.groupon.com/trest'
    : 'https://staging.groupon.com/trest';

const send = async (event: object): Promise<void> => {
  try {
    await fetch(TrackyEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': `Tracky/VPCS:Suboptimal/${VERSION} node-fetch/${
          fetch.prototype?.constructor?.version ?? 'unknown version'
        }`,
      },
      body: JSON.stringify(event),
    });
  } catch (e) {
    console.error(e);
  }
};

class TrackyAPILogger extends Tracky {
  constructor() {
    super();
  }

  log() {
    send(this.content);
  }
}

const track = (data: object) => {
  const t = new TrackyAPILogger();
  return t.data(data);
};

const write = (data: object) => {
  const t = new TrackyAPILogger();
  return t.data(data).log();
};

export { track, write, TrackyAPILogger };
