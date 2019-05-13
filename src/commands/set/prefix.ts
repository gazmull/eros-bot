import { Message } from 'discord.js';
import Command from '../../struct/command';

// tslint:disable-next-line:no-var-requires
const { defaultPrefix }: { defaultPrefix: string } = require('../../../auth');

export default class extends Command {
  constructor () {
    super('set-prefix', {
      description: {
        content: 'Changes the server\'s prefix.',
        usage: '<prefix value>',
        examples: [ 'e?', 'eros' ]
      },
      args: [
        {
          id: 'prefix',
          type: (_, word) => {
            if (!word) return null;
            if (/\s/.test(word) || word.length > 10) return null;

            return word;
          },
          default: defaultPrefix,
          prompt: {
            start: 'what would you like to set the prefix to?',
            retry: 'please provide a prefix without spaces and less than 10 characters.'
          }
        },
      ]
    });
  }

  public async exec (message: Message, { prefix }: { prefix: string }) {
    await this.client.db.Guild.update(
      { prefix },
      { where: { id: message.guild.id } }
    );

    return message.util.reply(`I have changed the server prefix to \`${prefix}\`.`);
  }
}
