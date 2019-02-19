import ErosCommand from '../../struct/command';
import { ITagInstance } from '../../struct/models/factories/tag';

export default class extends ErosCommand {
  constructor () {
    super('tag-delete', {
      description: {
        content: 'Deletes a tag.',
        usage: '<tag name>'
      },
      args: [
        {
          id: 'tag',
          type: 'tag',
          match: 'content',
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

    if (tag.author !== message.author.id && !isManager) {
      message.util.reply('you have no power here!');

      return this.fail(message);
    }

    await tag.destroy();

    return message.util.reply(`Done! tag **${tag.name}** has been deleted.`);
  }
}
