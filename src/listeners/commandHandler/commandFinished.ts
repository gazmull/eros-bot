import { Listener } from 'discord-akairo';
import { TextChannel } from 'discord.js';
import ErosCommand from '../../struct/command/Command';
import { error } from '../../util/console';

export default class extends Listener {
  constructor () {
    super('commandFinished', {
      emitter: 'commandHandler',
      event: 'commandFinished'
    });
  }

  public async exec (message: Message, command: ErosCommand) {
    const channel = message.channel as TextChannel;

    if (command.paginated) return;
    else if (!message.guild) return;
    else if (!channel.permissionsFor(message.guild.me).has([ 'ADD_REACTIONS' ])) return;

    const dialog = message.util.lastResponse;
    if (!dialog || dialog.deleted) return;
    else if (!dialog.embeds.length) return;

    try {
      await dialog.react('🗑');
      const toDelete = await dialog.awaitReactions((r, u) =>
        r.emoji.name === '🗑' && u.id === message.author.id,
        { max: 1, time: 30 * 1000, errors: [ 'time' ] }
      );

      if (toDelete.first()) await dialog.delete();
    } catch (c) {
      if (c instanceof Error) error(c);

      dialog.reactions.removeAll().catch();
    }
  }
}
