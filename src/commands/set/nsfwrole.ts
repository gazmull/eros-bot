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
    await this.client.db.Guild.update(
      { nsfwRole: role.id },
      { where: { id: message.guild.id } }
    );

    return message.util.reply(`I have changed the NSFW Role to \`${role.name}\`.`);
  }
}
