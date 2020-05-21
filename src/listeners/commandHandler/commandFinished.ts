import { Listener } from 'discord-akairo';
import { Message, TextChannel } from 'discord.js';
import Command from '../../struct/command';

export default class extends Listener {
  constructor () {
    super('commandFinished', {
      emitter: 'commandHandler',
      event: 'commandFinished'
    });
  }

  public async exec (message: Message, command: Command) {
    const channel = message.channel as TextChannel;

    if (command.noTrash) return;
    else if (!message.guild) return;
    else if (!channel.permissionsFor(message.guild.me).has([ 'ADD_REACTIONS' ])) return;

    const dialog = message.util.lastResponse;
    if (!dialog || dialog.deleted) return;
    else if (!dialog.embeds.length) return;

    try {
      await dialog.react('🗑');
      const toDelete = await dialog.awaitReactions(
        (r, u) => r.emoji.name === '🗑' && u.id === message.author.id,
        { max: 1, time: 5e3, errors: [ 'time' ] }
      );

      if (toDelete.first()) await dialog.delete();
    } catch (c) {
      if (c instanceof Error) this.client.logger.error(c);

      dialog.reactions.removeAll().catch();
    }
  }
}
