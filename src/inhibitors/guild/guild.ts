import { Inhibitor } from 'discord-akairo';
// @ts-ignore
import { blacklist } from '../../../auth';

export default class extends Inhibitor {
  constructor () {
    super('guildInhibit', {
      reason: 'blacklisted server',
      type: 'all'
    });
  }

  public exec (message: Message) {
    return message.guild && blacklist.includes(message.guild.id);
  }
}
