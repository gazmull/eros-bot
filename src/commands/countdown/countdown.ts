import { Flag } from 'discord-akairo';
import { Collection, Message } from 'discord.js';
import * as fs from 'fs-nextra';
import * as moment from 'moment-timezone';
import { ICountdown } from '../../../typings';
import Command from '../../struct/command';
import prettifyMs from '../../util/prettifyMs';

export default class extends Command {
  constructor () {
    super('countdown', {
      aliases: [ 'countdown', 'cd' ],
      description: {
        content: [
          'Displays countdowns related to Kamihime PROJECT in-game events.',
          'It includes special and some regular events.',
          'Available Methods:',
          '- `help`',
          '- `add`',
          '- `remove`',
          '- `del`',
          '- `delete`',
          '- `test`',
          '- `check`',
          '- `subscribe`',
        ],
        usage: '[method] [arguments]',
        examples: [
          '',
          'add 2018-04-23T00:00 A User\'s Birthday',
          'delete A User\'s Birthday',
          'test 2018-05-16T20:00',
        ]
      }
    });

    this.init();
  }

  public timezone = 'America/Los_Angeles';

  protected filename = `${__dirname}/../../../provider/countdown.json`;

  public countdowns: Collection<number, string[]> = new Collection();

  public userCountdowns: Collection<number, string[]> = new Collection();

  public * args () {
    const child = yield {
      type: [
        [ 'countdown-add', 'add' ],
        [ 'countdown-delete', 'remove', 'del', 'delete' ],
        [ 'countdown-test', 'test', 'check' ],
        [ 'countdown-subscribe', 'subscribe', 'sub' ],
        [ 'countdown-current', 'current', 'now' ],
        [ 'countdown-help', 'help' ],
      ]
    };

    return child ? Flag.continue(child) : { };
  }

  public async exec (message: Message) {
    const embed = this.client.embed(message);

    await this.prepareCountdowns();

    for (const [ key, names ] of this.countdowns)
      embed.addField(this.getCountdown(key), names.map(n => `❯ ${n}`).join('\n'));

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
      const name = preset.name;
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
            case 'DLY':
              offset = 60 * 24;
              break;
          }

          date.add(offset, 'minute');
        }

      if (today && !expired()) {
        const parsedDate = date.valueOf();

        this.checkDuplicate(this.countdowns, { name, date: parsedDate });

        if (this.client.scheduler && !name.endsWith(toAppend))
          this.client.scheduler.add(parsedDate, name);
      }
    }

    this.countdowns = this.countdowns.concat(this.userCountdowns);
    this.countdowns = this.countdowns.sort((_, __, a, b) => a - b);

    await this.save();
  }

  public exists (filename: string) {
    return fs.pathExists(filename);
  }

  public async init () {
    const exists = await this.exists(this.filename);

    if (exists) {
      const countdowns: ICountdown[] = await fs.readJSON(this.filename);

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
    return fs.outputFile(
      this.filename,
      JSON.stringify(this.userCountdowns.map((names, date) => ({ [ date ]: names })))
    );
  }

  public getCountdown (date: number) {
    const now = moment.tz(this.timezone).valueOf();
    const remaining = date - now;

    return prettifyMs(remaining);
  }

  public resolveCountdown (name: string) {
    const resolved = this.userCountdowns.findKey(el => el.includes(name));

    return resolved
      ? {
        date: resolved,
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
    ];
  }
}
