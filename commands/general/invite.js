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

    return message.util.reply(
      `Documentation: <${docs}>` +
      `\nInvite link: <${inviteLink}>` +
      `\nBot Author: ${owner}`
    );
  }
}

module.exports = InviteCommand;
