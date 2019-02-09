// @ts-ignore
import * as config from '../auth';
import ErosClient from './struct/ErosClient';
import { error, warn } from './util/console';

const client = new ErosClient(config).build();

client
  .init()
  .catch(error);

client
  .on('disconnect', () => process.exit(0))
  .on('error', error)
  .on('warn', warn);

process.on('unhandledRejection', error);
