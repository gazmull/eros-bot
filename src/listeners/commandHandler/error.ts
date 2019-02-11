import { Listener } from 'discord-akairo';
import ErosCommand from '../../struct/command';
import ErosError from '../../struct/ErosError';

export default class extends Listener {
  constructor () {
    super('error', {
      emitter: 'commandHandler',
      event: 'error'
    });
  }

  public exec (err: IError, message: Message, command: ErosCommand) {
    if (command && message) return new ErosError(message, err, err.step);
  }
}

interface IError extends Error {
  step?: number;
}
