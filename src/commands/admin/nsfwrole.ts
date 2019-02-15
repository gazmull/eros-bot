import { Role } from 'discord.js';
import ErosCommand from '../../struct/command';
import ErosClient from '../../struct/ErosClient';

export default class extends ErosCommand {
  constructor () {
    super('nsfwrole', {
      aliases: [ 'nsfwrole' ],
      description: {
        content: 'Changes this server\'s NSFW Role.',
        usage: '<resolvable role>',
        examples: [ '@lewd', '2138547751248890915', 'nsfw' ]
      },
      userPermissions: [ 'MANAGE_GUILD' ],
      channel: 'guild',
      lock: 'user',
      args: [
        {
          id: 'role',
          type: 'role',
          default: null,
          prompt: {
            start: 'what would you like to set the NSFW Role to?',
            retry: 'please provide a valid role resolvable.'
          }
        },
      ]
    });
  }

  public async exec (message: Message, { role }: { role: Role }) {
    const client = this.client as ErosClient;
    const oldRole = client.guildSettings.get(message.guild.id, 'nsfwRoleID', null);
    const resolvedRole = message.guild.roles.get(oldRole);
    await client.guildSettings.set(message.guild.id, 'nsfwRoleID', role.id);

    return message.util.reply(
      `I have changed the NSFW Role ${
        oldRole && resolvedRole ? `from \`${resolvedRole.name}\` ` : ''}to \`${role.name}\`.`);
  }
}
