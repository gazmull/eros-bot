import { Listener } from 'discord-akairo';
import ErosClient from '../../struct/ErosClient';

export default class extends Listener {
  constructor () {
    super('messageInvalid', {
      emitter: 'commandHandler',
      event: 'messageInvalid'
    });
  }

  public async exec (message: Message) {
    if (!message.guild) return;
    if (!message.util!.parsed!.prefix && !message.util!.parsed!.afterPrefix) return;

    const commandHandler = (this.client as ErosClient).commandHandler;
    const command = commandHandler.modules.get('tag-show');

    if (!command) return;

    const args = await command.parse(message, message.util.parsed.afterPrefix);

    return commandHandler.runCommand(message, command, args);
  }
}
