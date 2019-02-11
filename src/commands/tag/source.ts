import ErosCommand from '../../struct/command';
import { ITagInstance } from '../../struct/models/tag';

export default class extends ErosCommand {
  constructor () {
    super('tag-source', {
      description: {
        content: 'Displays a tag\'s source.',
        usage: '<tag name>'
      },
      channel: 'guild',
      ratelimit: 2,
      lock: 'user',
      args: [
        {
          id: 'tag',
          match: 'content',
          type: 'tag',
          prompt: {
            start: 'what is the name of the tag?',
            retry: (message: Message, input: { phrase: string }) =>
              `${message.author}, **${input.phrase}** does not exist. Please provide again.`
          }
        },
      ]
    });
  }

  public exec (message: Message, { tag }: { tag: ITagInstance }) {
    return message.util.reply(tag.content, { code: 'md' });
  }
}
