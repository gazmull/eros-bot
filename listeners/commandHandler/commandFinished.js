const { Listener } = require('discord-akairo');

class CommandFinishedListener extends Listener {
  constructor() {
    super('commandFinished', {
      emitter: 'commandHandler',
      event: 'commandFinished'
    });
  }

  async exec(message) {
    if(!message.guild) return;
    else if(!message.channel.permissionsFor(this.client.user).has('ADD_REACTIONS')) return;
    else if(!message.util.lastResponse) return;
    else if(message.util.command.paginated) return;

    const dialog = await message.channel.messages.fetch(message.util.lastResponse.id);
    if(!dialog) return;
    else if(!dialog.embeds.length) return;

    try {
      await dialog.react('🗑');
      const toDelete = await dialog.awaitReactions((r, u) =>
          r.emoji.name === '🗑' && u.id === message.author.id, { max: 1, time: 30 * 1000, errors: ['time'] });
      if(toDelete.first())
          await dialog.delete();
    }
    catch (c) {
        if(await message.channel.messages.fetch(dialog.id))
          dialog.reactions.removeAll();
        c.stack ? new AkairoError(c) : null;
    }
  }
}

module.exports = CommandFinishedListener;