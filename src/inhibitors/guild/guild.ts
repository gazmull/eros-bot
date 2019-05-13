import { Inhibitor } from 'discord-akairo';
import { Message } from 'discord.js';

export default class extends Inhibitor {
  constructor () {
    super('guildInhibitor', {
      reason: 'blacklisted server',
      type: 'all'
    });
  }

  public exec (message: Message) {
    return message.guild && this.client.config.blacklist.includes(message.guild.id);
  }
}
