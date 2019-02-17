import { Listener } from 'discord-akairo';

export default class extends Listener {
  constructor () {
    super('cooldown', {
      emitter: 'commandHandler',
      event: 'cooldown'
    });
  }

  public exec (message: Message, _, ms: number) {
    const seconds = (ms / 1000).toFixed(1);

    return message.reply(message.reply(`You are still on cooldown. Check back within ${seconds} seconds.`));
  }
}
