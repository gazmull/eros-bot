import ErosListener from '../../struct/listener';

export default class extends ErosListener {
  constructor () {
    super('cooldown', {
      emitter: 'commandHandler',
      event: 'cooldown'
    });
  }

  public exec (message: Message, _, ms: number) {
    const seconds = (ms / 1000).toFixed(1);

    return message.reply(`you are still on cooldown. Check back within ${seconds} seconds.`);
  }
}
