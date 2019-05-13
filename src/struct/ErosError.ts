import { Message } from 'discord.js';
import { supportLink } from '../../auth';
import Command from './command';

export default class ErosError {

  /**
   * Constructor for ErosError.
   * @param message - The Message object of the client.
   * @param command - The command that was used.
   * @param error - The Error object, if there is one.
   * @param code - Available Codes
   *     - `0`: Client Error (default)
   *     - `1`: KamihimeDB Request
   *     - `2`: Kamihime Fandom Request
   *     - `3`: Menu Selection
   */
  constructor (message: Message, command: Command, error: Error = null, code = 0) {
    this.message = message;

    this.command = command;

    this.err = error;

    this.code = code;

    this.exec();
  }

  protected message: Message;

  protected command: Command;

  protected err: Error;

  protected code: number;

  protected exec () {
    if (this.err) this.command.client.logger.error(this.err);

    let step: string;
    let title = 'An error occured';

    switch (this.code) {
     case 0: step = 'Client Error'; break;
     case 1: step = 'KamihimeDB Request'; break;
     case 2: step = 'Fandom Request'; break;
     case 3: step = 'Menu Selection'; break;
    }

    if (this.command) title = `Command **\`${this.command.id}\`** failed`;

    const message = [
      `${title}:`,
      '\`\`\`x1',
      `${this.err}\`\`\`${this.code >= 0 && this.code <= 3 ? `Step: ${step}` : step}`,
      `\nIs it a consistent error? Submit an issue here: ${supportLink}`,
    ];

    return this.message.util.lastResponse
      ? this.message.util.edit(message)
      : this.message.util.send(message);
  }
}
