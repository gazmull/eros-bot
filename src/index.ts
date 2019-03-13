import IErosClientOptions from '../typings/auth';
import ErosClient from './struct/ErosClient';

// tslint:disable-next-line:no-var-requires
const config: IErosClientOptions = require('../../../../auth');

const client = new ErosClient(config);

client
  .build()
  .init()
  .catch(err => client.logger.error(err));

client
  .on('disconnect', () => process.exit(0))
  .on('error', err => client.logger.error(err))
  .on('warn', inf => client.logger.warn(inf));

process.on('unhandledRejection', err => client.logger.error(err));
