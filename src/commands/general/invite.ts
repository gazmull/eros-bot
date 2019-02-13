// @ts-ignore
import { docs, inviteLink } from '../../../auth';
import ErosCommand from '../../struct/command';

export default class extends ErosCommand {
  constructor () {
    super('invite', {
      aliases: [ 'invite', 'addbot', 'inviteme' ],
      description: { content: 'Displays my invite link and my author\'s tag to contact.' }
    });
  }

  public async exec (message: Message) {
    const client = this.client;
    const owner = await client.users.fetch(client.ownerID as string);
    const embed = this.util.embed(message)
      .setThumbnail(client.user.displayAvatarURL())
      .setDescription([
        `Documentation: <${docs}>`,
        `Invite link: <${inviteLink}>`,
        `Bot Author: ${owner}`,
      ]);

    return message.util.send(embed);
  }
}
