import { Listener } from 'discord-akairo';
import { Message } from 'discord.js';

export default class extends Listener {
  constructor () {
    super('cooldown', {
      emitter: 'commandHandler',
      event: 'cooldown'
    });
  }

  public exec (message: Message, _, ms: number) {
    const seconds = (ms / 1000).toFixed(1);

    return message.util.reply(`you are still on cooldown. Check back within ${seconds} seconds.`);
  }
}
