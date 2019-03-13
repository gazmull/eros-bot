import { Listener } from 'discord-akairo';
import { Message } from 'discord.js';
import ErosCommand from '../../struct/command';

export default class extends Listener {
  constructor () {
    super('commandLocked', {
      emitter: 'commandHandler',
      event: 'commandLocked'
    });
  }

  public exec (message: Message, command: ErosCommand) {
    const userBased = [
      'you have an existing command that is waiting for you to respond.',
      'If you wish to continue with a new command, please say `cancel` first.',
    ];
    const defaultBased = [
      `looks like this command is currently being used in this channel.`,
      'Please try again later.',
    ];

    return message.util.reply(command.lock(message, null) === message.author.id ? userBased : defaultBased);
  }
}
