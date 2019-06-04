import { Message } from 'discord.js';
import * as moment from 'moment';
import Command from '../../struct/command';
import CountdownCommand from './countdown';

export default class extends Command {
  constructor () {
    super('countdown-add', {
      description: {
        content: 'Adds a countdown.',
        usage: '<countdown date> <countdown name>',
        examples: [ '2018-04-23T00:00 A User\'s Birthday' ]
      },
      ratelimit: 2,
      args: [
        {
          id: 'date',
          type: 'countdownDate',
          prompt: {
            start: 'when should the new countdown expire?',
            retry: 'it should be a valid date, see `@Eros cd help`. Please provide again.'
          }
        },
        {
          id: 'name',
          type: 'existingCountdown',
          match: 'rest',
          prompt: {
            start: 'what should the new countdown be named?',
            retry: (_, input: { phrase: string }) =>
              `**${input.phrase}** already exists. Please provide again.`
          }
        },
      ]
    });
  }

  public async exec (message: Message, { name, date }: { name: string, date: moment.Moment }) {
    const parent = this.handler.modules.get('countdown') as CountdownCommand;
    const parsedDate = Number(date.format('x'));

    parent.checkDuplicate(parent.userCountdowns, { name, date: parsedDate });
    await parent.save();

    // this.client.scheduler.emit('add', parsedDate, name);

    return message.util.reply(`\`${name}\` countdown added! Expires within ${parent.getCountdown(parsedDate)}`);
  }
}
