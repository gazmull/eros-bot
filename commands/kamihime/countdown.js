const Command = require('../../struct/custom/Command');
const moment = require('moment-timezone');
const fs = require('fs');
const { promisify } = require('util');
const { Collection } = require('discord.js');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const stat = promisify(fs.stat);

const { loading } = require('../../auth').emojis;

class CountdownCommand extends Command {
  constructor() {
    super('countdown', {
      aliases: ['countdown', 'cd'],
      description: {
        content: [
          'Displays countdowns related to Kamihime Project in-game events.',
          'It includes special and some regular events.'
        ].join('\n'),
        usage: '[command] [command argument]',
        examples: ['', 'add A User\'s Birthday 2018-04-23T00:00', 'test Event End 2018-05-16T20:00']
      },
      args: [
        { id: 'command' },
        { id: 'details', match: 'rest' }
      ]
    });
    this.preset = [
      { class: 'DLY', name: 'Daily Reset', time: '00:00', day: '*' },
      { class: 'ENH', name: 'Weapon/Eidolon Enhancement Quest 1', time: '12:00', day: '*' },
      { class: 'ENH', name: 'Weapon/Eidolon Enhancement Quest 2', time: '19:00', day: '*' },
      { class: 'ENH', name: 'Weapon/Eidolon Enhancement Quest 3', time: '22:00', day: '*' },
      { class: 'GEM', name: 'Monday Gem Quest 1', time: '12:00', day: 'Monday' },
      { class: 'GEM', name: 'Monday Gem Quest 2', time: '19:00', day: 'Monday' },
      { class: 'GEM', name: 'Tuesday Gem Quest 1', time: '12:30', day: 'Tuesday' },
      { class: 'GEM', name: 'Tuesday Gem Quest 2', time: '19:30', day: 'Tuesday' },
      { class: 'GEM', name: 'Wednesday Gem Quest 1', time: '18:00', day: 'Wednesday' },
      { class: 'GEM', name: 'Wednesday Gem Quest 2', time: '22:30', day: 'Wednesday' },
      { class: 'GEM', name: 'Thursday Gem Quest 1', time: '19:00', day: 'Thursday' },
      { class: 'GEM', name: 'Thursday Gem Quest 2', time: '23:00', day: 'Thursday' },
      { class: 'GEM', name: 'Friday Gem Quest 1', time: '19:30', day: 'Friday' },
      { class: 'GEM', name: 'Friday Gem Quest 2', time: '23:30', day: 'Friday' },
      { class: 'GEM', name: 'Saturday Gem Quest 1', time: '12:00', day: 'Saturday' },
      { class: 'GEM', name: 'Saturday Gem Quest 2', time: '18:00', day: 'Saturday' },
      { class: 'GEM', name: 'Saturday Gem Quest 3', time: '22:00', day: 'Saturday' },
      { class: 'GEM', name: 'Sunday Gem Quest 1', time: '12:30', day: 'Sunday' },
      { class: 'GEM', name: 'Sunday Gem Quest 2', time: '19:00', day: 'Sunday' },
      { class: 'GEM', name: 'Sunday Gem Quest 3', time: '23:00', day: 'Sunday' }
    ];
    this.timezone = 'America/Los_Angeles';
    this.filename = `${__dirname}/../../provider/countdown.json`;
    this.countdowns = new Collection();

    this.init();
  }

  async exists(filename) {
    try {
      await stat(filename);

      return true;
    } catch (e) {
      return false;
    }
  }

  async init() {
    const exists = await this.exists(this.filename);

    if (exists) {
      const countdowns = JSON.parse(await readFile(this.filename, 'utf8')).countdowns;

      if (!countdowns.length) return;

      for (const countdown of countdowns) {
        const name = Object.keys(countdown)[0];
        const date = Object.values(countdown)[0];

        this.countdowns.set(name, date);
      }
    } else
      await this.save();
  }

  async save() {
    const array = [];

    for (const [k, v] of this.countdowns.entries())
      array.push({ [k]: v });

    await writeFile(this.filename, JSON.stringify({ countdowns: array }));
  }

  authorized(user) {
    const ownerID = this.client.ownerID;

    return user.id === ownerID;
  }

  getCountdown(date) {
    const { timezone } = this;
    date = moment(date, 'x').tz(timezone);
    const now = moment().tz(timezone).format('x');
    const remaining = date - now;
    let days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    let hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((remaining % (1000 * 60)) / 1000);

    days = days < 1 ? '' : `${days}d `;
    hours = hours < 10 ? `0${hours}:` : `${hours}:`;
    minutes = minutes < 10 ? `0${minutes}:` : `${minutes}:`;
    seconds = seconds < 10 ? `0${seconds}` : `${seconds}`;

    return days.concat(hours, minutes, seconds);
  }

  async getCountdowns() {
    const { timezone, countdowns } = this;
    const oldSize = countdowns.size;

    if (!oldSize) return new Collection();

    for (const [k, v] of countdowns.entries()) {
      const date = moment(v).seconds(0);
      const now = moment().tz(timezone);
      const expired = now.isAfter(date);

      if (expired)
        countdowns.delete(k);
    }

    if (countdowns.size !== oldSize)
      await this.save();

    return countdowns;
  }

  async exec(message, { command, details }) {
    command = command ? command.toLowerCase() : '';
    const hasCommand = ['help', 'add', 'remove', 'test'].includes(command);
    const authorized = hasCommand && this.authorized(message.author);

    await message.util.send(`${loading} Preparing...`);

    if (!(hasCommand || authorized || (hasCommand && command === 'test'))) return this.defaultCommand(message);

    const { timezone, countdowns } = this;
    let date;
    let name;

    switch (command.toLowerCase()) {
      case 'help': {
        return this.authorisedHelp(message);
      }

      case 'add': {
        details = details.split(/ +/g);
        date = moment.tz(details.pop(), timezone).seconds(0);
        name = details.join(' ');

        this.countdowns.set(name, date);
        await this.save();

        return message.util.edit(`\`${name}\` countdown added! Expires within ${this.getCountdown(date)}`);
      }

      case 'remove': {
        name = details;

        if (countdowns.get(name)) {
          countdowns.delete(name);
          await this.save();

          return message.util.edit(`\`${name}\` countdown removed!`);
        }

        return message.util.edit(`Countdown named \`${name}\` not found.`);
      }

      case 'test':
      case 'check': {
        date = moment.tz(details, timezone).seconds(0);

        return message.util.edit(`The provided date expires within ${this.getCountdown(date)}`);
      }
    }
  }

  checkDuplicate(countdowns, name, date) {
    const duplicateKey = countdowns.findKey((_, k) => k.format('x') === date.format('x'));
    const duplicateValue = countdowns.get(duplicateKey);

    if (duplicateKey)
      countdowns.set(date, duplicateValue.push(name));
    else
      countdowns.set(date, [name]);

    return Promise.resolve(1);
  }

  async defaultCommand(message) {
    const { timezone, preset } = this;
    const toAppend = ' - End';
    let countdowns = new Collection();

    for (const countdown of preset) {
      const t = countdown.time.split(':');
      const hour = t[0];
      const minute = t[1];
      const date = moment().tz(timezone).hours(hour).minutes(minute).seconds(0).milliseconds(0);
      const now = moment().tz(timezone);
      const dayNow = now.format('dddd');
      const expired = () => now.isAfter(date);
      const today = countdown.day === '*' || dayNow === countdown.day;

      if (today && expired(date))
        if (countdown.class) {
          let offset;

          switch (countdown.class) {
            case 'ENH':
              offset = 60;

              if (!countdown.name.endsWith(toAppend))
                countdown.name += toAppend;
              break;
            case 'GEM':
              offset = 30;

              if (!countdown.name.endsWith(toAppend))
                countdown.name += toAppend;
              break;
            case 'DLY':
              offset = 60 * 24;
              break;
          }

          date.add(offset, 'minute');
        }

      if (today && !expired()) {
        if (countdown.name.endsWith(toAppend))
          countdown.name.splice(countdown.name.indexOf(toAppend));

        await this.checkDuplicate(countdowns, countdown.name, date);
      }
    }

    const userCountdowns = await this.getCountdowns();

    if (userCountdowns.size)
      for (const [k, v] of userCountdowns.entries()) {
        const date = moment(v).tz(timezone).seconds(0).milliseconds(0);

        await this.checkDuplicate(countdowns, k, date);
      }

    countdowns = countdowns.sort((a, b) => {
      const getDate = val => countdowns.findKey(v => v === val);

      return getDate(a) - getDate(b);
    });
    const embed = this.client.util.embed()
      .setColor(0xFF00AE);

    for (const countdown of countdowns.keys()) {
      const date = moment(countdown).tz(timezone);
      const names = countdowns.get(countdown);

      if (!Array.isArray(names)) continue;

      embed.addField(`${this.getCountdown(date)} — ${date.format('YYYY/MM/DD HH:mm')} PDT`, names.map(n => `❯ ${n}`).join('\n'));
    }

    return message.util.edit({ embed });
  }

  authorisedHelp(message) {
    const prefix = this.handler.prefix(message);
    const embed = this.client.util.embed()
      .setColor(0xFF00AE)
      .addField('Adding a Countdown', [
        `❯ Usage: ${prefix}countdown add [name] [date]`,
        '❯ Date Format: [YYYY]-[MM]-[DD]T[HH]:[mm]',
        '❯ Note: Date has to be provided in PDT. https://time.is/PDT'
      ])
      .addField('Removing a Countdown', `❯ Usage: ${prefix}countdown remove [name]`)
      .addField('Testing a Countdown', [
        `❯ Usage: ${prefix}countdown test [date]`,
        '❯ Same date format from adding a countdown.'
      ]);

    return message.util.edit({ embed });
  }
}

module.exports = CountdownCommand;
