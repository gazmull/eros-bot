import { Message } from 'discord.js';
import ErosCommand from '../../struct/command';

// [DEPRECATED]
// `hareminfo` command on a character with loli contents will be restricted ALWAYS.
// This is to completely follow Discord Guidelines, due to increase of server count.
export default class extends ErosCommand {
  constructor () {
    super('set-loli', {
      description: { content: 'Changes this server\'s Loli restriction condition. Toggle-able command.' }
    });
  }

  public async exec (message: Message) {
    const guild = await this.client.db.Guild.findOne({
      where: { id: message.guild.id },
      attributes: [ 'id', 'loli' ]
    });

    await guild.update({ loli: !guild.loli });

    return message.util.reply(
      !guild.loli
        ? 'I have disabled Loli contents restriction in this server.'
        : 'I have enabled Loli contents restriction in this server.'
    );
  }
}
