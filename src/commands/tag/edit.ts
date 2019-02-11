import ErosCommand from '../../struct/command';
import ErosClient from '../../struct/ErosClient';
import { ITagAttributes, ITagInstance } from '../../struct/models/tag';

export default class extends ErosCommand {
  constructor () {
    super('tag-edit', {
      description: {
        content: 'Edits a tag.',
        usage: '<tag name> <tag content> [--hoist/--unhoist]',
        examples: [ 'codes ***breathes heavily*** CODES', 'thisIsHoisted hoisted, sir --hoist' ]
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
            retry: (message: Message, input: { phrase: string }) =>
              `${message.author}, **${input.phrase}** does not exist. Please provide again.`
          }
        },
        {
          id: 'hoisted',
          match: 'flag',
          flag: [ '-h', '--hoist', '-p', '--pin' ]
        },
        {
          id: 'unhoisted',
          match: 'flag',
          flag: [ '-u', '--unhoist', '--unpin' ]
        },
        {
          id: 'content',
          match: 'rest',
          type: 'tagContent',
          prompt: {
            start: 'what should the future tag contain?',
            retry: 'content should not be empty or not be exceeding 1950 characters. Please provide again.'
          }
        },
      ]
    });
  }

  public async exec (
    message: Message,
    { tag, content, hoisted, unhoisted }: { tag: ITagInstance, content: string, hoisted: boolean, unhoisted: boolean }
  ) {
    const isManager = message.member.hasPermission('MANAGE_GUILD');

    if (tag.authorId !== message.author.id && !isManager) {
      message.util.reply('are you trying to vandalise?');

      return this.fail(message);
    }
    if (content && content.length > 1950) {
      message.util.reply('uh oh, your content exceeds the 2000 characters limit!');

      return this.fail(message);
    }

    const client = this.client as ErosClient;
    const updateValues: Partial<ITagAttributes> = { content, modifiedBy: message.author.id };
    let hoist;

    if (hoisted) hoist = true;
    else if (unhoisted) hoist = false;

    if (hoist !== undefined) updateValues.hoisted = hoist;

    await client.db.Tag.update(updateValues, {
      where: {
        name: tag.name,
        guildId: tag.guildId
      }
    });

    return message.util.reply(`Done! tag **${tag.name}** has been updated.`);
  }
}
