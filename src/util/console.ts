import chalk from 'chalk';
import * as moment from 'moment-timezone';
import { createLogger, format, transports } from 'winston';

export default class Logger {
  public logger = createLogger({
    transports: [ new transports.Console() ],
    format: format.printf(
      log => `${chalk.bgMagenta.whiteBright(this.time)}: [${this.setColour(log.level)}] ${log.message}`
    )
  });

  protected setColour (type: string) {
    type = type.toUpperCase();

    switch (type.toLowerCase()) {
      default: return chalk.cyan(type);
      case 'info': return chalk.greenBright(type);
      case 'debug': return chalk.magentaBright(type);
      case 'warn': return chalk.yellowBright(type);
      case 'error': return chalk.redBright(type);
    }
  }

  get time () {
    return moment().format('DD/MM, HH:mm:ss');
  }
}
