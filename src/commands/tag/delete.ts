import ErosCommand from '../../struct/command';
import ErosClient from '../../struct/ErosClient';
import { ITagInstance } from '../../struct/models/tag';

export default class extends ErosCommand {
  constructor () {
    super('tag-delete', {
      description: {
        content: 'Deletes a tag.',
        usage: '<tag name>'
      },
      channel: 'guild',
      ratelimit: 2,
      lock: 'user',
      args: [
        {
          id: 'tag',
          type: 'tag',
          prompt: {
            start: 'what is the name of the tag?',
            retry: (_, __, input: { phrase: string }) =>
              `**${input.phrase}** does not exist. Please provide again.`
          }
        },
      ]
    });
  }

  public async exec (message: Message, { tag }: { tag: ITagInstance }) {
    const isManager = message.member.hasPermission('MANAGE_GUILD');

    if (tag.authorId !== message.author.id && !isManager) {
      message.util.reply('you have no power here!');

      return this.fail(message);
    }

    const client = this.client as ErosClient;
    await client.db.Tag.destroy({
      where: {
        name: tag.name,
        guildId: tag.guildId
      }
    });

    return message.util.reply(`Done! tag **${tag.name}** has been deleted.`);
  }
}
