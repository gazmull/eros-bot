const { Listener } = require('discord-akairo');
const destroyGuild = require('../../provider/methods/destroyGuild');

class GuildLeaveListener extends Listener {
  constructor() {
    super('guildDelete', {
      emitter: 'client',
      event: 'guildDelete'
    });
  }

  exec(guild) {
    destroyGuild(guild);
  }
}

module.exports = GuildLeaveListener;
