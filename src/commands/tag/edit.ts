import { Control } from 'discord-akairo';
import ErosCommand from '../../struct/command';
import { Tag } from '../../struct/models/factories/Tag';

export default class extends ErosCommand {
  constructor () {
    super('tag-edit', {
      description: {
        content: 'Edits a tag.',
        usage: '<tag name> [tag content] [--hoist/--unhoist]',
        examples: [ 'codes ***breathes heavily*** CODES', 'thisIsHoisted hoisted, sir --hoist' ]
      },
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
        Control.if((_, args) => args.hoisted || args.unhoisted, [], [
          {
            id: 'content',
            match: 'rest',
            type: 'tagContent',
            prompt: {
              start: 'what should the future tag contain?',
              retry: 'content should not be empty or not be exceeding 1950 characters. Please provide again.'
            }
          },
        ]),
      ]
    });
  }

  public async exec (
    message: Message,
    { tag, content, hoisted, unhoisted }: { tag: Tag, content: string, hoisted: boolean, unhoisted: boolean }
  ) {
    const isManager = message.member.hasPermission('MANAGE_GUILD');

    if (tag.author !== message.author.id && !isManager) {
      message.util.reply('are you trying to vandalise?');

      return this.fail(message);
    }
    if (content && content.length > 1950) {
      message.util.reply('uh oh, your content exceeds the 2000 characters limit!');

      return this.fail(message);
    }

    const updateValues: Partial<Tag> = { modifiedBy: message.author.id };
    let hoist;

    if (hoisted) hoist = true;
    else if (unhoisted) hoist = false;

    if (hoist !== undefined) updateValues.hoisted = hoist;
    else updateValues.content = content;

    await tag.update(updateValues);

    const hoistStatus = hoist !== undefined
      ? hoist
        ? 'hoisted'
        : 'unhoisted'
      : 'updated';

    return message.util.reply(`Done! tag **${tag.name}** has been ${hoistStatus}.`);
  }
}
