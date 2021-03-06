import { Listener } from 'discord-akairo';
import { Message } from 'discord.js';
import Command from '../../struct/command';
import ErosError from '../../struct/ErosError';

export default class extends Listener {
  constructor () {
    super('error', {
      emitter: 'commandHandler',
      event: 'error'
    });
  }

  public exec (err: IError, message: Message, command: Command) {
    if (command && message) return new ErosError(message, command, err, err.step);
  }
}

interface IError extends Error {
  step?: number;
}
