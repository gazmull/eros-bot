import { Message } from 'discord.js';
import * as moment from 'moment-timezone';
import Command from '../../struct/command';
import CountdownCommand from './countdown';

export default class extends Command {
  constructor () {
    super('countdown-current', {
      description: { content: 'Shows the current date and time.' },
      ratelimit: 2
    });
  }

  public async exec (message: Message) {
    const parent = this.handler.modules.get('countdown') as CountdownCommand;

    return message.util.reply(`Current time is: ${moment.tz(parent.timezone)}`);
  }
}
