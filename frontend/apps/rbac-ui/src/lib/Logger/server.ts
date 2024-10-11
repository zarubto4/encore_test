import { NextApiRequest, NextApiResponse } from 'next';
import { server } from '@vpcs/grpn-next-logging/server';
import { handleError } from '@/utils';
import { LOGGER_APP_NAME } from '@/constants';
import { StenoKVRecordType } from '@vpcs/grpn-next-logging';

type LogServerProps = {
  message: string;
  level?: 'info' | 'debug' | 'warn';
  data?: StenoKVRecordType;
  req?: NextApiRequest;
  res?: NextApiResponse;
  status?: number;
};

type CritProps = {
  error: unknown;
  req?: NextApiRequest;
  res?: NextApiResponse;
  status?: number;
  level?: 'info' | 'debug' | 'warn' | 'crit';
};

function logServer({ message, data = {}, level = 'info' }: LogServerProps) {
  return server.log(LOGGER_APP_NAME)[level](message).data({ source: 'backend' }).data(data);
}

export async function crit({ req, res, error, status = 500}: CritProps) {
  const message = error instanceof Response ? await error.text() : handleError(error);
 
  // Create a new headers object without the cookie header
  const { cookie, ...headers } = req?.headers || {};

  const logger = server
    .log(LOGGER_APP_NAME)
    .crit(message)
    .data({ source: 'backend' })    
    .data({ status })

  if (req) {
    logger
      .receive(req.body)
      .data({ body: req.body })
      .data({ query: req.query })
  }
  if (headers) {
    logger.data({ headers });
  }

  logger.write();

  if (res) {
    return res.status(status).json({ message });
  }
}

export async function info(message: string, data?: StenoKVRecordType) {
  logServer({ message, data, level: 'info' }).write();
}

export async function debug(message: string, data?: StenoKVRecordType) {
  logServer({ message, data, level: 'debug' }).write();
}

export async function warn(message: string, data?: StenoKVRecordType) {
  logServer({ message, data, level: 'warn' }).write();
}
