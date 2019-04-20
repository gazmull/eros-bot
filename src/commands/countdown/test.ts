import { Message } from 'discord.js';
import * as moment from 'moment';
import Command from '../../struct/command';
import CountdownCommand from './countdown';

export default class extends Command {
  constructor () {
    super('countdown-test', {
      description: {
        content: 'Tests a date for countdown.',
        usage: '<countdown date>',
        examples: [ '2018-04-23T00:00' ]
      },
      ratelimit: 2,
      args: [
        {
          id: 'date',
          type: 'countdownDate',
          prompt: {
            start: 'when should the countdown expire?',
            retry: 'it should be a valid date, see `@Eros cd help`. Please provide again.'
          }
        },
      ]
    });
  }

  public async exec (message: Message, { date }: { date: moment.Moment }) {
    const parent = this.handler.modules.get('countdown') as CountdownCommand;
    const parsedDate = Number(date);

    return message.util.reply(`the provided date expires within ${parent.getCountdown(parsedDate)}`);
  }
}
