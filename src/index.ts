import IErosClientOptions from '../typings/auth';
import ErosClient from './struct/ErosClient';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const config: IErosClientOptions = require('../auth');

const client = new ErosClient(config);

client
  .build()
  .init()
  .catch(err => client.logger.error(err));

client
  .on('disconnect', () => {
    client.destroy();

    return process.exit(0);
  })
  .on('error', err => client.logger.error(err))
  .on('warn', inf => client.logger.warn(inf));

process.on('unhandledRejection', err => client.logger.error(err));
