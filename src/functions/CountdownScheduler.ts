import { Collection, TextChannel } from 'discord.js';
import Scheduler from 'node-schedule';
import { Op } from 'sequelize';
import ErosClient from '../struct/ErosClient';

/**
 * todo
 *  - make it possible not to restart the client just for this
 *  - non-destructive entries
 *  - basically screw this shit
 */
export default class {
  constructor (client: ErosClient) {
    this.client = client;

    this.schedules = new Collection();
  }

  protected client: ErosClient;
  public schedules: Collection<Date, any>;

  public async init () {
    if (this.schedules.size) this.schedules.clear();

    // @ts-ignore
    const countdowns = await this.client.commandHandler.findCommand('countdown').prepareCountdowns(true);

    for (const [ date, entries ] of countdowns.entries()) {
      const entry = { type: entries[0].type, names: entries.map(el => el.name) };

      this.assign(date, entry);
    }

    Scheduler.scheduleJob({ hour: 0, minute: 0, second: 0 }, () => this.init());
  }

  public async distribute (names: string[]) {
    const guilds = await this.client.db.Guild.findAll({
      // @ts-ignore
      where: {
        cdChannelID: { [Op.ne]: null },
        cdRoleID: { [Op.ne]: null }
      }
    });

    const tick = this.client.setInterval(() => {
      if (!guilds.length) return this.client.clearInterval(tick);

      const spliced = guilds.splice(0, 5);

      for (const guild of spliced) {
        const channel = this.client.channels.get(guild.cdChannelID) as TextChannel;

        if (!channel) continue;

        const role = channel.guild.roles.get(guild.cdRoleID);

        if (!role) continue;

        channel.send(`${role}, **countdown** for ${names.map(n => `**${n}**`).join(', ')} has ended.`);
      }
    }, 3000);
  }

  public assign (date: Date, data) {
    let result = `${date} Assigned.`;

    switch (data.type) {
      default: {
        result = `${date} Invalid.`;
        break;
      }
      case 'PRE': {
        const fn = Scheduler.scheduleJob(date, this.distribute(data.names));

        this.schedules.set(date, { names: data.names, fn, type: data.type });
      }
    }

    return result;
  }

  public relinquish (entry) {
    const entries = this.schedules.find(el => el.names.includes(entry));

    if (!entries) return `${entry} Schedule does not exist.`;

    const entryKey = this.schedules.findKey(el => JSON.stringify(el) === JSON.stringify(entries));

    if (!entryKey) return `${entry} Schedule does not exist.`;
    if (entries.type === 'PRE') return `${entry} Cannot modify preset countdowns.`;

    entries.names.splice(entries.names.indexOf(entry), 1);
    entries.fn = this.distribute(entries.names);

    this.schedules.set(entryKey, entries);

    return `${entry} Relinquished.`;
  }
}
