import { Message } from 'discord.js';
import Command from '../../struct/command';

export default class extends Command {
  constructor () {
    super('tag-show', {
      description: {
        content: 'Displays a tag.',
        usage: '<tag name>'
      },
      channel: 'guild',
      ratelimit: 2,
      args: [
        {
          id: 'name',
          match: 'content',
          type: (_, name) => {
            if (!name) return null;

            return name;
          },
          prompt: { start: 'what is the name of the tag?' }
        },
      ]
    });
  }

  public async exec (message: Message, { name }: { name: string }) {
    const tag = await this.client.db.Tag.findOne({
      where: {
        name,
        guild: message.guild.id
      },
      attributes: [ 'id', 'uses', 'content' ]
    });

    if (!tag) return;

    await tag.increment('uses');

    return message.util.send(tag.content);
  }
}
