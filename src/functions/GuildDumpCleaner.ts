import { AkairoClient } from 'discord-akairo';

export default class {

  constructor (client: AkairoClient) {
    this.client = client;
  }

  public client: AkairoClient;

  public async init () {
    this.client.logger.info('[GDumpCleaner]: Started');

    const guilds = await this.client.db.GuildDump.findAll({
      where: this.client.db.Sequelize.literal('DATE_ADD(date, INTERVAL 7 DAY) < NOW()'),
      attributes: [ 'id' ]
    });

    if (guilds.length)
      try {
        const mapped = guilds.map(v => v.id);

        await this.client.db.Level.destroy({ where: { guild: mapped } });
        await this.client.db.Tag.destroy({ where: { guild: mapped } });
        await this.client.db.Guild.destroy({ where: { id: mapped } });
        await this.client.db.GuildDump.destroy({ where: { id: mapped } });

        this.client.logger.info(`[GDumpCleaner]: Deleted ${guilds.length} entries`);
      } catch (err) {
        this.client.logger.warn(`[GDumpCleaner]: Failed to delete ${guilds.length} entries (${err.message})`);
      }

    this.client.logger.info('[GDumpCleaner]: Ended');
  }
}
