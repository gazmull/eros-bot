import { Role } from 'discord.js';
import ErosCommand from '../../struct/command';

export default class extends ErosCommand {
  constructor () {
    super('set-nsfwrole', {
      description: {
        content: 'Changes this server\'s NSFW Role.',
        usage: '<role>',
        examples: [ '@lewd', '2138547751248890915', 'nsfw' ]
      },
      args: [
        {
          id: 'role',
          type: 'role',
          default: null,
          prompt: {
            start: 'what would you like to set the NSFW Role to?',
            retry: 'please provide a valid role.'
          }
        },
      ]
    });
  }

  public async exec (message: Message, { role }: { role: Role }) {
    const oldRole = this.client.guildSettings.get(message.guild.id, 'nsfwRole', null);
    const resolvedRole = message.guild.roles.get(oldRole);
    await this.client.guildSettings.set(message.guild.id, 'nsfwRole', role.id);

    return message.util.reply(
      `I have changed the NSFW Role ${
        oldRole && resolvedRole ? `from \`${resolvedRole.name}\` ` : ''}to \`${role.name}\`.`);
  }
}
