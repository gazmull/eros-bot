const { Inhibitor } = require('discord-akairo');
const { blacklist } = require('../../auth');

class GuildInhibitor extends Inhibitor {
  constructor() {
    super('guildInhibit', { reason: 'blacklisted guild' });
  }

  exec(message) {
    return message.guild && blacklist.includes(message.guild.id);
  }
}

module.exports = GuildInhibitor;
