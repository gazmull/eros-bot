const { Listener } = require('discord-akairo');
const initGuild = require('../../provider/methods/initGuild');

class GuildCreateListener extends Listener {
  constructor() {
    super('guildCreate', {
      emitter: 'client',
      event: 'guildCreate'
    });
  }

  async exec(guild) {
    return await initGuild(guild);
  }
}

module.exports = GuildCreateListener;