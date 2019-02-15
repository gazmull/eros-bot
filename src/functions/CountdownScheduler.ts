import { Collection, TextChannel } from 'discord.js';
import { EventEmitter } from 'events';
import * as moment from 'moment';
import { Op } from 'sequelize';
import CountdownCommand from '../commands/countdown/countdown';
import ErosClient from '../struct/ErosClient';
import { status, warn } from '../util/console';

export default class extends EventEmitter {
  constructor (client: ErosClient) {
    super();

    this.client = client;

    this.init();
  }

  protected client: ErosClient;

  public schedules: Collection<number, { names: string[], fn: NodeJS.Timer }> = new Collection();

  public init () {
    this.provider.prepareCountdowns().then(() => {
      const countdowns = this.provider.countdowns;

      for (const [ date, names ] of countdowns)
        for (const name of names)
          this.add(date, name);

      status('CountdownScheduler Module: Initialised.');
    });
  }

  public async distribute (date: number, names: string[]) {
    try {
      this.destroy(date);

      const guilds = await this.client.db.Guild.findAll({ where: { cdChannelID: { [Op.ne]: null } } });
      const tick = this.client.setInterval(async () => {
        if (!guilds.length) {
          status('CountdownScheduler Module: Distributed ' + names.join(', '));

          return this.client.clearInterval(tick);
        }

        const spliced = guilds.splice(0, 5);

        for (const guild of spliced) {
          const channel = this.client.channels.get(guild.cdChannelID) as TextChannel;

          if (!channel) continue;

          let action = 'started/ended';
          const nameEnds =  names.filter(n => n.endsWith('End')).sort();
          const nameNotEnds = names.filter(n => !n.endsWith('End')).sort();
          let prettyNames = [
            ...nameNotEnds,
            ...nameEnds,
          ];

          if (nameEnds.length && !nameNotEnds.length) {
            action = 'ended';
            prettyNames = prettyNames.map(v => v.slice(0, -6));
          } else if (nameNotEnds.length && !nameEnds.length) action = 'started';

          prettyNames = prettyNames.map((v, i, arr) => {
            const end = arr.length > 1 && i === (arr.length - 1) ? 'and ' : '';

            return `${end}**${v}**`;
          });
          const isPlural = names.length > 1 ? 'have' : 'has';
          const role = channel.guild.roles.get(guild.cdRoleID);
          const roleText = role ? `${role}, ` : '';

          await channel.send(`${roleText}${prettyNames.join(', ')} ${isPlural} ${action}!`);
        }
      }, 3000);
    } catch (err) { warn('Error Sending Notification: ' + err); }

    await this.provider.prepareCountdowns();
  }

  public add (date: number, name: string) {
    const job = this.schedules.get(date);

    if (job && job.names.includes(name)) return this;

    const names  = job ? job.names.concat(name) : [ name ];
    const parsedDate = date - moment.tz(this.provider.timezone).valueOf();
    const fn = this.client.setTimeout(() => this.distribute(date, names), parsedDate);

    if (job) this.client.clearTimeout(job.fn);

    this.schedules.set(date, { names, fn });

    status('CountdownScheduler Module: Added ' + name);

    return this;
  }

  public delete (date: number, name: string) {
    const job = this.schedules.get(date);

    if (!job) return this;

    job.names.splice(job.names.indexOf(name), 1);

    const parsedDate = date - moment.tz(this.provider.timezone).valueOf();
    const names = job.names;
    const fn = this.client.setTimeout(() => this.distribute(date, names), parsedDate);

    this.client.clearTimeout(job.fn);

    if (!job.names.length) return this.destroy(date);

    this.schedules.set(date, { names, fn });

    status('CountdownScheduler Module: Deleted ' + name);

    return this;
  }

  public destroy (date: number) {
    const job = this.schedules.get(date);

    if (job) this.schedules.delete(date);
    status('CountdownScheduler Module: Destroyed ' + date);

    return this;
  }

  get provider () {
    return this.client.commandHandler.modules.get('countdown') as CountdownCommand;
  }

  // @ts-ignore
  public emit (event: 'delete' | 'add', date: number, name: string): boolean;

  // @ts-ignore
  public on (event: 'delete' | 'add', listener: (date: number, name: string) => any): this;
}
