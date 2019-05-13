import { Command, Inhibitor } from 'discord-akairo';
import { Message } from 'discord.js';

export default class extends Inhibitor {
  constructor () {
    super('countdownInhibitor', {
      reason: 'countdown unauthorized'
    });
  }

  public exec (message: Message, command: Command) {
    const [ child ] = message.util.parsed.content.split(/ +/g);

    return command.id === 'countdown'
      && [ 'add', 'remove', 'del', 'delete' ].includes(child)
      && !this.client.config.countdownAuthorized.includes(message.author.id);
  }
}
