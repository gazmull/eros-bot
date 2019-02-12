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
    const parsed = message.util.parsed;

    if (!message.guild && parsed!.prefix) return;
    if (!parsed.afterPrefix || !parsed.alias) return;

    const commandHandler = (this.client as ErosClient).commandHandler;
    const command = commandHandler.modules.get('tag-show');
    const args = await command.parse(message, message.util.parsed.afterPrefix);

    return commandHandler.runCommand(message, command, args);
  }
}
