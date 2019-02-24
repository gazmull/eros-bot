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
    await this.client.db.Guild.update(
      { cdRole: role.id },
      { where: { id: message.guild.id } }
    );

    return message.util.reply(`I have changed the Countdown Subscriber Role to \`${role.name}\`.`);
  }
}
