const Scheduler = require('node-schedule');
const { and } = require('sequelize');

// const { status } = require('../utils/console');
const model = require('../provider/models/guild');

class CountdownScheduler {
  constructor(client) {
    this.client = client;

    this.schedules = client.util.collection();
  }

  async init() {

    /**
     * @type {Collection<Date, string[]>} Collection of preset + user countdowns
     */
    // const countdowns = await this.client.commandHandler.findCommand('countdown').prepareCountdowns(true);

    // for (const date of countdowns.values())
    //   for (const entry of date) {

    //   }
  }

  assign(date, data) {
    switch (data.type) {
      case 'PRE': {
        const fn = Scheduler.scheduleJob(date, this.distribute().bind(null, data.name));

        this.schedules.set(date, fn);
      }
    }
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
}

module.exports = { CountdownScheduler };
