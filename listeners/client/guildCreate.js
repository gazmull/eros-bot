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
    const initiated = await initGuild(guild);
    
    const me = this.client.user;
    const guildSize = this.client.guilds.size;
    return me.setActivity(
      `${guildSize === 1
        ? this.client.guilds.first()
        : `${guildSize} Guilds`} | @${me.username} help`, { type: 'LISTENING' });
  }
}

module.exports = GuildCreateListener;