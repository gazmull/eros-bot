import { Message } from 'discord.js';
import ErosComamnd from '../../struct/command';

export default class extends ErosComamnd {
  constructor () {
    super('dood', {
      aliases: [ 'dood', 'd00d' ],
      description: { content: 'D00000000000000d' }
    });
  }

  public async exec (message: Message, { words }: { words: string }) {
    const o = 'o'.repeat(Math.floor(Math.random() * 100))
      .split('')
      .map((v, i) => Math.floor(Math.random() * 2) ? v.toLowerCase() : v.toUpperCase()).join('');

    return message.util.send(`d${o}d`);
  }
}
