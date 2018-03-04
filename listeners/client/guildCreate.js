const { Listener } = require('discord-akairo');
const initGuild = require('../../provider/methods/initGuild');

class GuildCreateListener extends Listener {
  constructor() {
    super('guildCreate', {
      emitter: 'client',
      event: 'guildCreate'
    });
  }

  exec(guild) {
    initGuild(guild);
  }
}

module.exports = GuildCreateListener;
