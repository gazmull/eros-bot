const { Listener } = require('discord-akairo');
const { error } = require('../../utils/console');

class CommandFinishedListener extends Listener {
  constructor() {
    super('commandFinished', {
      emitter: 'commandHandler',
      event: 'commandFinished'
    });
  }

  async exec(message, command) {
    if (command.paginated) return;
    else if (!message.guild) return;
    else if (!message.channel.permissionsFor(message.guild.me).has(['ADD_REACTIONS', 'MANAGE_MESSAGES'])) return;
    else if (!message.util.lastResponse) return;

    const dialog = message.util.lastResponse;
    if (!dialog) return;
    else if (!dialog.embeds.length) return;

    try {
      await dialog.react('🗑');
      const toDelete = await dialog.awaitReactions((r, u) =>
        r.emoji.name === '🗑' && u.id === message.author.id, { max: 1, time: 30 * 1000, errors: ['time'] });

      if (toDelete.first())
        await dialog.delete();
    } catch (c) {
      if (c instanceof Error) error(c.stack);

      dialog.reactions.removeAll().catch();
    }
  }
}

module.exports = CommandFinishedListener;
