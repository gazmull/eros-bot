import { Role } from 'discord.js';
import ErosCommand from '../../struct/command';
import ErosClient from '../../struct/ErosClient';

export default class extends ErosCommand {
  constructor () {
    super('cdrole', {
      aliases: [ 'cdrole', 'countdownrole' ],
      description: {
        content: 'Changes this guild\'s Countdown Subscriber Role.',
        usage: '<resolvable role>',
        examples: [ '@cd', '2138547751248890915', 'countdown' ]
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
            start: 'what would you like to set the Countdown Subscriber Role to?',
            retry: 'please provide a valid role resolvable.'
          }
        },
      ]
    });
  }

  public async exec (message: Message, { role }: { role: Role }) {
    const client = this.client as ErosClient;
    const oldRole = client.guildSettings.get(message.guild.id, 'cdRoleID', null);
    const resolvedRole = message.guild.roles.get(oldRole);
    await client.guildSettings.set(message.guild.id, 'cdRoleID', role.id);

    return message.util.reply(
      `I have changed the Countdown Subscriber Role ${
        oldRole && resolvedRole ? `from \`${resolvedRole.name}\` ` : ''}to \`${role.name}\`.`);
  }
}
