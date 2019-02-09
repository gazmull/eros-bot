import { Listener } from 'discord-akairo';

export default class extends Listener {
  constructor () {
    super('commandLocked', {
      emitter: 'commandHandler',
      event: 'commandLocked'
    });
  }

  public exec (message: Message) {
    return message.reply([
      'you have an existing command that is waiting for you to respond.',
      'If you wish to continue with a new command, please say `cancel` first.',
    ].join(' '));
  }
}
