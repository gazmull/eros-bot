// @ts-ignore
import { defaultPrefix } from '../../../auth';
import Command from '../../struct/command/Command';
import ErosClient from '../../struct/ErosClient';

export default class extends Command {
  constructor () {
    super('prefix', {
      aliases: [ 'prefix' ],
      description: {
        content: 'Changes this guild\'s prefix.',
        usage: '<prefix value>',
        examples: [ 'e?', 'eros' ]
      },
      userPermissions: [ 'MANAGE_GUILD' ],
      channel: 'guild',
      lock: 'user',
      args: [
        {
          id: 'prefix',
          type: word => {
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

  public async exec (message: Message, { prefix }) {
    const client = this.client as ErosClient;
    const oldPrefix = client.guildSettings.get(message.guild.id, 'prefix', defaultPrefix);
    await client.guildSettings.set(message.guild.id, 'prefix', prefix);

    return message.util.reply(`I have changed the guild prefix from \`${oldPrefix}\` to \`${prefix}\`.`);
  }
}
