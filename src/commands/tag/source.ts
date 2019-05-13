import { Message } from 'discord.js';
import Command from '../../struct/command';
import { Tag } from '../../struct/models/Tag';

export default class extends Command {
  constructor () {
    super('tag-source', {
      description: {
        content: 'Displays a tag\'s source.',
        usage: '<tag name>'
      },
      args: [
        {
          id: 'tag',
          match: 'content',
          type: 'tag',
          prompt: {
            start: 'what is the name of the tag?',
            retry: (_, input: { phrase: string }) =>
              `**${input.phrase}** does not exist. Please provide again.`
          }
        },
      ]
    });
  }

  public exec (message: Message, { tag }: { tag: Tag }) {
    return message.util.reply(tag.content, { code: 'md' });
  }
}
