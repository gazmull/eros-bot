import { Message } from 'discord.js';
import Command from '../../struct/command';

export default class extends Command {
  constructor () {
    super('invite', {
      aliases: [ 'invite', 'addbot', 'inviteme' ],
      description: { content: 'Displays my invite link and my author\'s tag to contact.' }
    });
  }

  public async exec (message: Message) {
    const { docs, inviteLink } = this.client.config;
    const owner = await this.client.users.fetch(this.client.ownerID as string);
    const embed = this.client.embed(message)
      .setThumbnail(this.client.user.displayAvatarURL())
      .setDescription([
        `Documentation: <${docs}>`,
        `Invite link: <${inviteLink}>`,
        `Bot Author: ${owner}`,
      ]);

    return message.util.send(embed);
  }
}
