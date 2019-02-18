import { Role } from 'discord.js';
import ErosCommand from '../../struct/command';

export default class extends ErosCommand {
  constructor () {
    super('set-countdownrole', {
      description: {
        content: 'Changes this server\'s Countdown Subscriber Role.',
        usage: '<role>',
        examples: [ '@cd', '2138547751248890915', 'countdown' ]
      },
      args: [
        {
          id: 'role',
          type: 'role',
          default: null,
          prompt: {
            start: 'what would you like to set the Countdown Subscriber Role to?',
            retry: 'please provide a valid role.'
          }
        },
      ]
    });
  }

  public async exec (message: Message, { role }: { role: Role }) {
    const oldRole = this.client.guildSettings.get(message.guild.id, 'cdRole', null);
    const resolvedRole = message.guild.roles.get(oldRole);
    await this.client.guildSettings.set(message.guild.id, 'cdRole', role.id);

    return message.util.reply(
      `I have changed the Countdown Subscriber Role ${
        oldRole && resolvedRole ? `from \`${resolvedRole.name}\` ` : ''}to \`${role.name}\`.`);
  }
}
