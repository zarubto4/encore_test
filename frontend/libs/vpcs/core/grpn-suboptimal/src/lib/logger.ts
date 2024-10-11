import 'server-only';
import { trackyLogConfig, Tracky } from './constants';
import * as Winston from 'winston';
import { NextApiRequest } from 'next';
const { format } = Winston;

const dataFormatter = format((info) => {
  const { message } = info;
  if (typeof message !== 'object') {
    return false;
  }
  if (!message.event_time) message.event_tiem = new Date().toISOString();
  return message;
});

const fileFormatter = Winston.format.combine(Winston.format.uncolorize(), dataFormatter(), Winston.format.json());
const consoleFormatter = Winston.format.combine(
  Winston.format.colorize(),
  dataFormatter(),
  Winston.format.prettyPrint(),
);

const logger = Winston.createLogger({
  level: 'debug',
  transports: [
    new Winston.transports.File({
      filename: [trackyLogConfig.path, trackyLogConfig.name].join('/'),
      format: fileFormatter,
    }),
    new Winston.transports.Console({
      format: consoleFormatter,
    }),
  ],
});

class TrackyLogger extends Tracky {
  constructor() {
    super();
  }

  log() {
    logger.info(this.content);
  }
}

const track = (data: object) => {
  const t = new TrackyLogger();
  return t.data(data);
};
const write = (data: object) => {
  const t = new TrackyLogger();
  return t.data(data).log();
};

const receive = (request: NextApiRequest) => {
  // receives tracky objects or multiple tracky objects on the post body
  // creates a new log for each and returns success with number of logs created
  let body = request.body;
  if (!body) return { success: false, message: 'No body found' };
  if (!Array.isArray(body) && typeof body === 'object') body = [body];
  try {
    body.forEach((log: object) => {
      const t = new TrackyLogger();
      t.data(log).log();
    });
    return { success: true, message: `${body.length} logs created`, count: body.length };
  } catch (e) {
    return { success: false, message: (e as Error).message };
  }
};

export { track, write, TrackyLogger, receive };
