import { Inhibitor } from 'discord-akairo';
import { blacklist } from '../../../auth';

export default class extends Inhibitor {
  constructor () {
    super('guildInhibit', {
      reason: 'blacklisted guild',
      type: 'all'
    });
  }

  public exec (message: Message) {
    return message.guild && blacklist.includes(message.guild.id);
  }
}
