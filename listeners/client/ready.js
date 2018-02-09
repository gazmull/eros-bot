const { Listener } = require('discord-akairo');
const { status, error } = require('../../utils/console');

class ReadyListener extends Listener {
  constructor() {
    super('ready', {
      emitter: 'client',
      event: 'ready'
    });
  }

  async exec() {
    try {
      const me = this.client.user;
      const guildSize = this.client.guilds.size;

      status(`Logged in as ${me.tag} (ID: ${me.id})`);
      me.setActivity(
        `${guildSize === 1
          ? this.client.guilds.first()
          : `${guildSize} Guilds`} | @${me.username} help`, { type: 'LISTENING' });

      if(!guildSize)
        status('Standby Mode');
      else
        status(`Listening to ${guildSize === 1
          ? this.client.guilds.first()
          : `${guildSize} Guilds`}`);
    }
    catch (err) { error(err); }
  }
}

module.exports = ReadyListener;