// @ts-ignore
import { docs, inviteLink } from '../../../auth';
import Command from '../../struct/command/Command';

export default class extends Command {
  constructor () {
    super('invite', {
      aliases: [ 'invite', 'addbot', 'inviteme' ],
      description: { content: 'Displays my invite link and my author\'s tag to contact.' }
    });
  }

  public async exec (message: Message) {
    const client = this.client;
    const owner = await client.users.fetch(client.ownerID as string);
    const embed = client.util.embed()
      .setColor(0xFF00AE)
      .setThumbnail(client.user.displayAvatarURL())
      .setDescription([
        `Documentation: <${docs}>`,
        `Invite link: <${inviteLink}>`,
        `Bot Author: ${owner}`,
      ]);

    return message.util.send(embed);
  }
}
