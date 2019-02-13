// @ts-ignore
import { bugs } from '../../package.json';
import { error as err } from '../util/console';

export default class ErosError {

  /**
   * Constructor for ErosError.
   * @param message - The Message object of the client.
   * @param error - The Error object, if there is one.
   * @param code - Available Codes
   *     - `0`: Client Error (default)
   *     - `1`: KamihimeDB Request
   *     - `2`: Kamihime Fandom Request
   *     - `3`: Menu Selection
   */
  constructor (message: Message, error: Error = null, code = 0) {
    this.message = message;

    this.err = error;

    this.code = code;

    this.exec();
  }

  protected message: Message;

  protected err: Error;

  protected code: number;

  protected exec () {
    if (this.err) err(this.err);

    let step: string;

    switch (this.code) {
     case 0: step = 'Client Error'; break;
     case 1: step = 'KamihimeDB Request'; break;
     case 2: step = 'Fandom Request'; break;
     case 3: step = 'Menu Selection'; break;
    }

    const message = [
      'I cannot complete the command because:',
      '\`\`\`x1',
      `${this.err}\`\`\`${this.code >= 0 && this.code <= 3 ? `Step: ${step}` : step}`,
      `\nIs it a consistent error? Submit an issue here: ${bugs.url}`,
    ];

    return this.message.util.lastResponse
      ? this.message.util.edit(message)
      : this.message.util.send(message);
  }
}
