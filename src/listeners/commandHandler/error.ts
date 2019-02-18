import ErosCommand from '../../struct/command';
import ErosError from '../../struct/ErosError';
import ErosListener from '../../struct/listener';

export default class extends ErosListener {
  constructor () {
    super('error', {
      emitter: 'commandHandler',
      event: 'error'
    });
  }

  public exec (err: IError, message: Message, command: ErosCommand) {
    if (command && message) return new ErosError(message, command, err, err.step);
  }
}

interface IError extends Error {
  step?: number;
}
