import { Guild } from 'discord.js';
import ErosListener from '../../struct/listener';

export default class extends ErosListener {
  constructor () {
    super('guildDelete', {
      emitter: 'client',
      event: 'guildDelete'
    });
  }

  public async exec (guild: Guild) {
    try {
      const guildEntry = await this.client.db.Guild.destroy({ where: { id: guild.id } });
      const guildSize = guild.client.guilds.size;

      if (!guildEntry)
        return this.client.logger.warn([
          `${guild.name} (ID: ${guild.id}) does not exist in the database, left anyway.`,
          `${guildSize} total guilds.`,
        ].join(' '));

      await this.client.db.Level.destroy({ where: { guild: guild.id } });
      await this.client.db.Tag.destroy({ where: { guild: guild.id } });

      this.client.logger.status(`${guild.name} (ID: ${guild.id}) destroyed. ${guildSize} total guilds.`);
    } catch (err) { this.client.logger.error(err); }
  }
}
