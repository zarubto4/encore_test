import { client } from '@vpcs/grpn-next-logging/client';
import { LOGGER_APP_NAME } from '@/constants';

export default function log() {
  return client.log(LOGGER_APP_NAME).data({ source: 'frontend' });
}
