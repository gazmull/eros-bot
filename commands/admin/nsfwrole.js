const Command = require('../../struct/custom/Command');

class SetNSFWRoleCommand extends Command {
  constructor() {
    super('nsfwrole', {
      aliases: ['nsfwrole', 'role'],
      description: {
        content: 'Changes this guild\'s NSFW Role.',
        usage: '<resolvable role>',
        examples: ['@lewd', '2138547751248890915', 'nsfw']
      },
      userPermissions: ['MANAGE_GUILD'],
      channel: 'guild',
      args: [
        {
          id: 'role',
          type: 'role',
          default: null,
          prompt: {
            start: 'what would you like to set the NSFW Role to?',
            retry: 'please provide a valid role resolvable.'
          }
        }
      ]
    });
  }

  async exec(message, { role }) {
    const oldRole = this.client.guildSettings.get(message.guild.id, 'nsfwRoleID', null);
    const resolvedRole = message.guild.roles.get(oldRole);
    await this.client.guildSettings.set(message.guild.id, 'nsfwRoleID', role.id);

    return message.util.reply(
      `I have changed the NSFW Role ${
        oldRole && resolvedRole ? `from \`${resolvedRole.name}\` ` : ''}to \`${role.name}\`.`);
  }
}

module.exports = SetNSFWRoleCommand;
