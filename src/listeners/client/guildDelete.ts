import { Listener } from 'discord-akairo';
import { Guild } from 'discord.js';
import ErosClient from '../../struct/ErosClient';
import { error, status, warn } from '../../util/console';

export default class extends Listener {
  constructor () {
    super('guildDelete', {
      emitter: 'client',
      event: 'guildDelete'
    });
  }

  public async exec (guild: Guild) {
    try {
      const client = this.client as ErosClient;
      const guildEntry = await client.db.Guild.destroy({ where: { id: guild.id } });
      const guildSize = guild.client.guilds.size;

      if (!guildEntry)
        return warn([
          `${guild.name} (ID: ${guild.id}) does not exist in the database, left anyway.`,
          `${guildSize} total guilds.`,
        ].join(' '));

      await client.db.Level.destroy({ where: { guild: guild.id } });
      await client.db.Tag.destroy({ where: { guild: guild.id } });

      status(`${guild.name} (ID: ${guild.id}) destroyed. ${guildSize} total guilds.`);
    } catch (err) { error(err); }
  }
}
