const ErosClient = require('./provider/index');
const { error, warn } = require('./utils/console');
const config = require('./auth');

const client = new ErosClient(config).build();

try {
  client.init();
} catch (err) {
  error(err);
}

client
  .on('disconnect', () => process.exit(0))
  .on('error', err => error(err))
  .on('warn', info => warn(info));

process.on('unhandledRejection', err => error(`Critical: ${err.stack}`));
