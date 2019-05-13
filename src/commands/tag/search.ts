import { Message } from 'discord.js';
import Command from '../../struct/command';

export default class extends Command {
  constructor () {
    super('tag-search', {
      description: {
        content: 'Searches for tags available in the server.',
        usage: '<tag name>'
      },
      args: [
        {
          id: 'name',
          match: 'content',
          prompt: {
            start: 'what is the name of tag(s) you are looking for?'
          }
        },
      ]
    });
  }

  public async exec (message: Message, { name }: { name: string }) {
    const matched = await this.client.db.Tag.findAll({
      attributes: [ 'name' ],
      where: {
        name: {
          [this.client.db.Op.like]: `%${name}%`
        }
      }
    });

    if (!matched.length)
      return message.util.reply(
        `no tags named ${name} found. Perhaps this is a good opportunity to make one with this name?`
      );

    const pretty = matched
      .map(t => `\`${t.name}\``)
      .sort()
      .join(', ');

    if (pretty.length >= 1440)
      return message.util.reply('ah, the result is too long. Care to search with better specifics again?');

    const embed = this.client.embed(message)
      .setAuthor(`${message.guild} (${message.guild.id})`)
      .setThumbnail(message.guild.iconURL({ format: 'webp' }))
      .setDescription(pretty);

    return message.util.send(embed);
  }
}
