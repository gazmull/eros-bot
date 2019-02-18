import ErosInhibitor from '../../struct/inhibitor';

export default class extends ErosInhibitor {
  constructor () {
    super('guildInhibit', {
      reason: 'blacklisted server',
      type: 'all'
    });
  }

  public exec (message: Message) {
    return message.guild && this.client.config.blacklist.includes(message.guild.id);
  }
}
