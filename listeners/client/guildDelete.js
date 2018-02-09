const { Listener } = require('discord-akairo');
const destroyGuild = require('../../provider/methods/destroyGuild');

class GuildLeaveListener extends Listener {
  constructor() {
    super('guildDelete', {
      emitter: 'client',
      event: 'guildDelete'
    });
  }

  async exec(guild) {
    const destroyed = await destroyGuild(guild);

    const me = this.client.user;
    const guildSize = this.client.guilds.size;
    return me.setActivity(
      `${guildSize === 1
        ? this.client.guilds.first()
        : `${guildSize} Guilds`} | @${me.username} help`, { type: 'LISTENING' });
  }
}

module.exports = GuildLeaveListener;