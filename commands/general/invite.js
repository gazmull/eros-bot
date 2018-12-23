const Command = require('../../struct/custom/Command');
const { inviteLink, docs } = require('../../auth');

class InviteCommand extends Command {
  constructor() {
    super('invite', {
      aliases: ['invite', 'addbot', 'inviteme'],
      description: { content: 'Displays my invite link and my author\'s tag to contact.' }
    });
  }

  async exec(message) {
    const owner = await this.client.users.fetch(this.client.ownerID);

    const embed = this.client.util.embed()
      .setColor(0xFF00AE)
      .setThumbnail(this.client.user.displayAvatarURL())
      .setDescription([
        `Documentation: <${docs}>`,
        `Invite link: <${inviteLink}>`,
        `Bot Author: ${owner}`
      ]);

    return message.util.send(embed);
  }
}

module.exports = InviteCommand;
