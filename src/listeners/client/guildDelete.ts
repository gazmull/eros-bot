import { Listener } from 'discord-akairo';
import { Guild } from 'discord.js';

export default class extends Listener {
  constructor () {
    super('guildDelete', {
      emitter: 'client',
      event: 'guildDelete'
    });
  }

  public async exec (guild: Guild) {
    try {
      const guildSize = guild.client.guilds.cache.size;

      await this.client.db.GuildDump.create({ id: guild.id });

      this.client.logger.info(`${guild.name} (ID: ${guild.id}) dumped. ${guildSize} total guilds.`);
    } catch (err) { this.client.logger.error(err); }
  }
}
