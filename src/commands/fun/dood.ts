import { Message } from 'discord.js';
import ErosComamnd from '../../struct/command';

export default class extends ErosComamnd {
  constructor () {
    super('dood', {
      aliases: [ 'dood', 'd00d' ],
      description: { content: 'D00000000000000d' }
    });
  }

  public async exec (message: Message) {
    const o = 'o'.repeat(Math.floor(Math.random() * 100));
    const d = `d${o}d`
      .split('')
      .map(v => Math.floor(Math.random() * 2) ? v.toLowerCase() : v.toUpperCase()).join('');

    return message.util.send(d);
  }
}
