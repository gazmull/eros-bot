import { Collection, User } from 'discord.js';
import * as fs from 'fs-extra';
import * as moment from 'moment-timezone';
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
        { id: 'method', type: [ 'help', 'current', 'add', 'remove', 'delete', 'del', 'test', 'check', 'subscribe' ] },
        { id: 'details', match: 'rest', default: '' },
      ]
    });

    this.init();
  }

  public timezone = 'America/Los_Angeles';

  private filename = `${__dirname}/../../../provider/countdown.json`;

  public countdowns: Collection<number, string[]> = new Collection();

  public userCountdowns: Collection<number, string[]> = new Collection();

  public authorized (user: User) {
    return this.client.config.countdownAuthorized.includes(user.id);
  }

  public async exec (message: Message, { method, details }: { method: string, details: string }) {
    const authorized = this.authorized(message.author);

    if (!method || (!authorized && ![ 'test', 'check' ].includes(method))) return this.defaultCommand(message);
    if (method === 'current') return message.util.reply(`Current time is: ${moment.tz(this.timezone)}`);
    if (method === 'help') return this.authorisedHelp(message);

    const commands: { [key: string]: ErosCommand } = {
      add: this.handler.modules.get('countdown-add'),
      del: this.handler.modules.get('countdown-delete'),
      delete: this.handler.modules.get('countdown-delete'),
      remove: this.handler.modules.get('countdown-delete'),
      test: this.handler.modules.get('countdown-test'),
      check: this.handler.modules.get('countdown-test'),
      subscribe: this.handler.modules.get('countdown-subscribe')
    };
    const command = commands[method];

    return this.handler.handleDirectCommand(message, details, command);
  }

  public async defaultCommand (message: Message) {
    const embed = this.util.embed(message);

    await this.prepareCountdowns();

    for (const [ key, names ] of this.countdowns)
      embed.addField(this.getCountdown(key), names.map(n => `❯ ${n}`).join('\n'));

    return message.util.send(embed);
  }

  public authorisedHelp (message: Message) {
    const prefix = this.handler.prefix(message);
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

    return message.util.send(embed);
  }

  public async prepareCountdowns () {
    const now = moment.tz(this.timezone);

    this.countdowns = this.countdowns.filter((_, date) => {
      const parsed = moment(date);

      return !now.isAfter(parsed);
    });
    this.userCountdowns = this.userCountdowns.filter((_, date) => {
      const parsed = moment(date);

      return !now.isAfter(parsed);
    });

    const presets = this.preset;

    for (const preset of presets) {
      let name = preset.name;
      const [ hour, minute ] = preset.time.split(':').map(i => Number(i));
      const date = moment.tz(this.timezone)
        .hours(hour)
        .minutes(minute)
        .seconds(0)
        .milliseconds(0);
      const dayNow = now.format('dddd');
      const today = preset.day === '*' || preset.day === dayNow;
      const expired = () => now.isAfter(date);
      const toAppend = ' - End';

      if (today && expired())
        if (preset.class) {
          let offset: number;

          switch (preset.class) {
            case 'ENH':
              offset = 60;
              name += toAppend;
              break;
            case 'GEM':
              offset = 30;
              name += toAppend;
              break;
            case 'DLY':
              offset = 60 * 24;
              break;
          }

          date.add(offset, 'minute');
        }

      if (today && !expired()) {
        const parsedDate = date.valueOf();

        this.checkDuplicate(this.countdowns, { name, date: parsedDate });

        if (this.client.scheduler) this.client.scheduler.add(parsedDate, name);
      }
    }

    this.countdowns = this.countdowns.concat(this.userCountdowns);
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

        this.userCountdowns.set(date, names);
      }
    }

    this.prepareCountdowns();
  }

  public async save () {
    const array: ICountdown[] = [];

    for (const [ date, names ] of this.userCountdowns)
      array.push({ [ date ]: names });

    return fs.writeFile(this.filename, JSON.stringify(array));
  }

  public getCountdown (date: number) {
    const now = moment.tz(this.timezone).valueOf();
    const remaining = date - now;

    return prettifyMs(remaining);
  }

  public resolveCountdown (name: string) {
    const resolvedName = this.userCountdowns.filter(el => el.includes(name));

    return resolvedName.size
      ?
        {
          date: this.userCountdowns.findKey(el => el.includes(name)),
          name
        }
      : null;
  }

  public checkDuplicate (countdowns: Collection<number, string[]>, { name, date }: { name: string, date: number }) {
    const entry = countdowns.get(date);

    if (!entry) return countdowns.set(date, [ name ]);

    const hasTheName = entry.includes(name);

    if (!hasTheName) return countdowns.set(date, entry.concat(name));
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
