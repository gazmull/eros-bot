// @ts-ignore
import * as config from '../auth';
import ErosClient from './struct/ErosClient';

const client = new ErosClient(config);

client
  .build()
  .init()
  .catch(client.logger.error);

client
  .on('disconnect', () => process.exit(0))
  .on('error', client.logger.error)
  .on('warn', client.logger.warn);

process.on('unhandledRejection', client.logger.error);
