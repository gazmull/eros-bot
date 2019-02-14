import { Command, PrefixSupplier } from 'discord-akairo';
import { Collection, User } from 'discord.js';
import * as fs from 'fs-extra';
import * as moment from 'moment-timezone';
// @ts-ignore
import { countdownAuthorized, emojis } from '../../../auth';
import ErosCommand from '../../struct/command';
import prettifyMs from '../../util/prettifyMs';

export default class extends ErosCommand {
  constructor () {
    super('countdown', {
      aliases: [ 'countdown', 'cd' ],
      description: {
        content: [
          'Displays countdowns related to Kamihime Project in-game events.',
          'It includes special and some regular events.',
          'Available Methods:',
          '- `help`',
          '- `add`',
          '- `remove`',
          '- `del`',
          '- `delete`',
          '- `test`',
          '- `check`',
        ],
        usage: '[method] [arguments]',
        examples: [
          '',
          'add 2018-04-23T00:00 A User\'s Birthday',
          'delete A User\'s Birthday',
          'test 2018-05-16T20:00',
        ]
      },
      args: [
        { id: 'method', type: [ 'help', 'add', 'remove', 'delete', 'del', 'test', 'check' ] },
        { id: 'details', match: 'rest', default: '' },
      ]
    });

    this.init();
  }

  public timezone = 'America/Los_Angeles';

  private filename = `${__dirname}/../../../provider/countdown.json`;

  public countdowns: Collection<number, string[]> = new Collection();

  public authorized (user: User) {
    return countdownAuthorized.includes(user.id);
  }

  public async exec (message: Message, { method, details }: { method: string, details: string }) {
    const authorized = this.authorized(message.author);

    if (!method || (!authorized && method !== 'test')) return this.defaultCommand(message);
    if (method === 'help') return this.authorisedHelp(message);

    const commands: { [key: string]: Command } = {
      add: this.handler.modules.get('countdown-add'),
      del: this.handler.modules.get('countdown-delete'),
      delete: this.handler.modules.get('countdown-delete'),
      remove: this.handler.modules.get('countdown-delete'),
      test: this.handler.modules.get('countdown-test'),
      check: this.handler.modules.get('countdown-test')
    };
    const command = commands[method];

    return this.handler.handleDirectCommand(message, details, command, true);
  }

  public async defaultCommand (message: Message) {
    const embed = this.util.embed(message);

    await this.prepareCountdowns();

    for (const [ key, names ] of this.countdowns) {
      const date = Number(moment(key).tz(this.timezone).format('x'));

      embed.addField(this.getCountdown(date), names.map(n => `❯ ${n}`).join('\n'));
    }

    return message.util.send({ embed });
  }

  public authorisedHelp (message: Message) {
    const prefix = (this.handler.prefix as PrefixSupplier)(message);
    const embed = this.util.embed(message)
      .setColor(0xFF00AE)
      .addField('Adding a Countdown', [
        `❯ Usage: ${prefix}countdown add <date> <name>`,
        '❯ Date Format: [YYYY]-[MM]-[DD]T[HH]:[mm]',
        '❯ Note: Date has to be provided in PDT. https://time.is/PDT',
        '❯ Note: Naming can also affect the countdown notifications, so be careful when to append `- End`!',
      ])
      .addField('Removing a Countdown', `❯ Usage: ${prefix}countdown remove <name>`)
      .addField('Testing a Countdown', [
        `❯ Usage: ${prefix}countdown test <date>`,
        '❯ Same date format from adding a countdown.',
      ]);

    return message.util.send({ embed });
  }

  public async prepareCountdowns () {
    if (this.countdowns.size)
      for (const [ date, names ] of this.countdowns) {
        const key = moment(date).tz(this.timezone);
        const now = moment.tz(this.timezone);
        const expired = now.isAfter(key);

        if (expired) {
          this.countdowns.delete(date);

          continue;
        }

        const parsedDate = Number(key.format('x'));

        for (const name of names)
          this.checkDuplicate({ name, date: parsedDate });
      }

    const preset = this.preset;

    for (const countdown of preset) {
      const [ hour, minute ] = countdown.time.split(':').map(i => Number(i));
      const now = moment().tz(this.timezone);
      const date = moment().tz(this.timezone, true).hours(hour).minutes(minute).seconds(0).milliseconds(0);
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
          }

          date.add(offset, 'minute');
        }

      const parsedDate = Number(date.format('x'));

      if (today && !expired())
        this.checkDuplicate({ name: countdown.name, date: parsedDate });
    }

    this.countdowns = this.countdowns.sort((_, __, a, b) => a - b);

    await this.save();
  }

  public exists (filename: string) {
    return fs.stat(filename)
      .then(() => true)
      .catch(() => false);
  }

  public async init () {
    const exists = await this.exists(this.filename);

    if (exists) {
      const countdowns: ICountdown[] = JSON.parse((await fs.readFile(this.filename)).toString());

      if (!countdowns.length) return;

      for (const countdown of countdowns) {
        const date = Number(Object.keys(countdown)[0]);
        const names = Object.values(countdown)[0];

        this.countdowns.set(date, names);
      }
    }

    this.prepareCountdowns();
  }

  public async save () {
    const array: ICountdown[] = [];

    for (const [ date, names ] of this.countdowns)
      array.push({ [ date ]: names });

    return fs.writeFile(this.filename, JSON.stringify(array));
  }

  public getCountdown (_date: number) {
    const date = Number(moment(_date, 'x').tz(this.timezone).format('x'));
    const now = Number(moment().tz(this.timezone).format('x'));
    const remaining = date - now;

    return prettifyMs(remaining);
  }

  public resolveCountdown (name: string) {
    const resolvedName = this.countdowns.filter(el => el.includes(name));

    return resolvedName.size
      ?
        {
          date: this.countdowns.findKey(el => el.includes(name)),
          name
        }
      : null;
  }

  public checkDuplicate ({ name, date }: { name: string, date: number }) {
    const entry = this.countdowns.get(date);

    if (!entry) return this.countdowns.set(date, [ name ]);

    const hasTheName = entry.includes(name);

    if (!hasTheName) this.countdowns.set(date, entry.concat(name));
  }

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
}
