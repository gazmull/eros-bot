const Scheduler = require('node-schedule');
const { and } = require('sequelize');

// const { status } = require('../utils/console');
const model = require('../provider/models/guild');

/**
 * todo
 *  - make it possible not to restart the client just for this
 *  - non-destructive entries
 *  - basically screw this shit
 */
class CountdownScheduler {
  constructor(client) {
    this.client = client;

    this.schedules = client.util.collection();
  }

  async init() {

    this.schedules = this.client.util.collection();

    /**
     * @type {Collection<Date, string[]>} Collection of preset + user countdowns
     */
    const countdowns = await this.client.commandHandler.findCommand('countdown').prepareCountdowns(true);

    for (const [date, entries] of countdowns.entries()) {
      const entry = { type: entries[0].type, names: entries.map(el => el.name) };

      CountdownScheduler.assign(date, entry);
    }

    Scheduler.scheduleJob({ hour: 0, minute: 0, second: 0 }, () => this.init());
  }

  async distribute(names) {
    const guilds = await model.findAll({
      where: and(
        { cdChannelID: { ne: null } },
        { cdRoleID: { ne: null } }
      )
    });

    const tick = this.client.setInterval(() => {
      if (!guilds.length) return this.client.clearInterval(tick);

      const spliced = guilds.splice(0, 5);

      for (const guild of spliced) {
        const channel = this.client.channels.get(guild.cdChannelID);

        if (!channel) continue;

        const role = channel.guild.roles.get(guild.cdRoleID);

        if (!role) continue;

        channel.send(`${role}, **countdown** for ${names.map(n => `**${n}**`).join(', ')} has ended.`);
      }
    }, 3000);
  }

  static assign(date, data) {
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

  static relinquish(entry) {
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

module.exports = { CountdownScheduler };
