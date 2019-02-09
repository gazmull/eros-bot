import { PrefixSupplier } from 'discord-akairo';
import { Collection, User } from 'discord.js';
import * as fs from 'fs-extra';
import * as moment from 'moment-timezone';
import { countdownAuthorized, emojis } from '../../../auth';
import Command from '../../struct/command/Command';

// ! - You need to rewrite this for simplier API. This current API sucks balls deep.
export default class extends Command {
  constructor () {
    super('countdown', {
      aliases: [ 'countdown', 'cd' ],
      description: {
        content: [
          'Displays countdowns related to Kamihime Project in-game events.',
          'It includes special and some regular events.',
        ].join('\n'),
        usage: '[command] [command argument]',
        examples: [ '', 'add A User\'s Birthday 2018-04-23T00:00', 'test Event End 2018-05-16T20:00' ]
      },
      args: [
        { id: 'command' },
        { id: 'details', match: 'rest' },
      ]
    });

    this.timezone = 'America/Los_Angeles';

    this.filename = `${__dirname}../../../../provider/countdown.json`;

    this.countdowns = new Collection();

    this.init();
  }

  protected timezone: string;
  private filename: string;
  public countdowns: Collection<string, moment.Moment>;

  get preset () {
    return [
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
      { class: 'GEM', name: 'Sunday Gem Quest 3', time: '23:00', day: 'Sunday' },
    ];
  }

  public exists (filename: string) {
      return fs.stat(filename)
        .then(() => true)
        .catch(() => false);
  }

  public async init () {
    const exists = await this.exists(this.filename);

    if (exists) {
      const countdowns = JSON.parse((await fs.readFile(this.filename)).toString());

      if (!countdowns.length) return;

      for (const countdown of countdowns) {
        const name = Object.keys(countdown)[0];
        const date = moment(Object.values(countdown)[0]);

        this.countdowns.set(name, date);
      }
    } else await this.save();
  }

  public async save () {
    const array = [];

    for (const [ k, v ] of this.countdowns.entries())
      array.push({ [k]: v });

    await fs.writeFile(this.filename, JSON.stringify(array));
  }

  public authorized (user: User) {
    return countdownAuthorized.includes(user.id);
  }

  public getCountdown (_date: moment.Moment) {
    const { timezone } = this;
    const date = Number(moment(_date, 'x').tz(timezone).format('x'));
    const now = Number(moment().tz(timezone).format('x'));
    const remaining = date - now;
    const _days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const _hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const _minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const _seconds = Math.floor((remaining % (1000 * 60)) / 1000);

    const days = _days < 1 ? '' : `${_days}d `;
    const hours = _hours < 10 ? `0${_hours}:` : `${_hours}:`;
    const minutes = _minutes < 10 ? `0${_minutes}:` : `${_minutes}:`;
    const seconds = _seconds < 10 ? `0${_seconds}` : String(_seconds);

    return days.concat(hours, minutes, seconds);
  }

  public async getCountdowns () {
    const { timezone, countdowns } = this;
    const oldSize = countdowns.size;

    if (!oldSize) return new Collection();

    for (const [ k, v ] of countdowns.entries()) {
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

  public async exec (message: Message, { command, details }) {
    command = command ? command.toLowerCase() : '';
    const hasCommand = [ 'help', 'add', 'remove', 'test' ].includes(command);
    const authorized = hasCommand && this.authorized(message.author);

    await message.util.send(`${emojis.loading} Preparing...`);

    if (!hasCommand || !authorized && command !== 'test') return this.defaultCommand(message);

    const { timezone, countdowns } = this;
    let date: moment.Moment;
    let name: string;

    switch (command.toLowerCase()) {
      case 'help': {
        return this.authorisedHelp(message);
      }

      case 'add': {
        if (!details) return this.defaultCommand(message);

        details = details.split(/ +/g);
        date = moment.tz(details.pop(), timezone).seconds(0);
        name = details.join(' ');

        this.countdowns.set(name, date);
        await this.save();

        return message.util.edit(`\`${name}\` countdown added! Expires within ${this.getCountdown(date)}`);
      }

      case 'remove': {
        if (!details) return this.defaultCommand(message);

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

  public checkDuplicate (countdowns, { name, date, type }, doUnix = false) {
    const duplicateKey = countdowns.findKey((_, k) => k.format('x') === date.format('x'));
    const duplicateValue = countdowns.get(duplicateKey);
    const shouldUnixDate = doUnix ? date.format('x') : date;
    const shouldUnixName = doUnix ? { name, type } : name;

    if (duplicateKey) countdowns.set(shouldUnixDate, duplicateValue.push(name));
    else countdowns.set(shouldUnixDate, [ shouldUnixName ]);

    return Promise.resolve(1);
  }

  public async prepareCountdowns (doUnix = false) {
    const { timezone } = this;
    const preset = this.preset;
    let countdowns = new Collection();

    for (const countdown of preset) {
      const [ hour, minute ] = countdown.time.split(':').map(i => Number(i));
      const now = moment().tz(timezone);
      const date = moment().tz(timezone).hours(hour).minutes(minute).seconds(0).milliseconds(0);
      const dayNow = now.format('dddd');
      const expired = () => now.isAfter(date);
      const today = countdown.day === '*' || dayNow === countdown.day;
      const toAppend = ' - End';

      if (today && expired())
        if (countdown.class) {
          let offset: number;

          switch (countdown.class) {
            case 'ENH':
              offset = 60;
              countdown.name += toAppend;
              break;
            case 'GEM':
              offset = 30;
              countdown.name += toAppend;
              break;
            case 'DLY':
              offset = 60 * 24;
              break;
          }

          date.add(offset, 'minute');
        }

      if (today && !expired())
        await this.checkDuplicate(countdowns, { name: countdown.name, date, type: 'PRE' }, doUnix);
    }

    const userCountdowns = await this.getCountdowns();

    if (userCountdowns.size)
      for (const [ k, v ] of userCountdowns.entries()) {
        const date = moment(v).tz(timezone).seconds(0).milliseconds(0);

        await this.checkDuplicate(countdowns, { name: k, date, type: 'USR' }, doUnix);
      }

    countdowns = countdowns.sort((a, b) => {
      const getDate = val => Number(countdowns.findKey(v => v === val));

      return getDate(a) - getDate(b);
    });

    return countdowns;
  }

  public async defaultCommand (message: Message) {
    const countdowns = await this.prepareCountdowns();
    const embed = this.client.util.embed()
      .setColor(0xFF00AE);

    for (const countdown of countdowns.keys()) {
      const date = moment(countdown).tz(this.timezone);
      const names = countdowns.get(countdown);

      if (!Array.isArray(names)) continue;

      embed.addField(this.getCountdown(date), names.map(n => `❯ ${n}`).join('\n'));
    }

    return message.util.edit({ embed });
  }

  public authorisedHelp (message: Message) {
    const prefix = (this.handler.prefix as PrefixSupplier)(message);
    const embed = this.client.util.embed()
      .setColor(0xFF00AE)
      .addField('Adding a Countdown', [
        `❯ Usage: ${prefix}countdown add [name] [date]`,
        '❯ Date Format: [YYYY]-[MM]-[DD]T[HH]:[mm]',
        '❯ Note: Date has to be provided in PDT. https://time.is/PDT',
      ])
      .addField('Removing a Countdown', `❯ Usage: ${prefix}countdown remove [name]`)
      .addField('Testing a Countdown', [
        `❯ Usage: ${prefix}countdown test [date]`,
        '❯ Same date format from adding a countdown.',
      ]);

    return message.util.edit({ embed });
  }
}
