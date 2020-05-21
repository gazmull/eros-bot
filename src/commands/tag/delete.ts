import { Message } from 'discord.js';
import Command from '../../struct/command';
import { Tag } from '../../struct/models/Tag';

export default class extends Command {
  constructor () {
    super('tag-delete', {
      description: {
        content: [
          'Deletes a tag.',
          'Append `--purge` to delete all tags based on the REGEX provided (<tag name> as REGEX).',
          'The provided REGEX must be on [PCRE](https://mariadb.com/kb/en/library/pcre) flavour.',
        ],
        usage: '<tag name> [--purge]',
        examples: [
          'myText',
          '^my(?!Text) --purge',
        ]
      },
      flags: [ '-p', '--purge' ]
    });
  }

  public * args () {
    const purge = yield {
      match: 'flag',
      flag: [ '-p', '--purge' ]
    };

    const tag = yield {
      type: purge ? 'string' : 'tag',
      match: 'rest',
      prompt: {
        start: purge
          ? 'what is the pattern for purging tags?'
          : 'what is the name of the tag?',
        retry: purge
          ? (_, input: { phrase: string }) => `**${input.phrase}** does not exist. Please provide again.`
          : (_, input: { phrase: string }) => `**${input.phrase}** does not exist. Please provide again.`
      }
    };

    return { purge, tag };
  }

  public async exec (message: Message, { tag, purge }: { tag: Tag | string, purge: boolean }) {
    const isManager = message.member.hasPermission('MANAGE_GUILD');
    const fail = () => {
      message.util.reply('you have no power here!');

      return this.handler.reactFail(message);
    };

    if ((tag as Tag).author !== message.author.id && !isManager) return fail();
    if (purge) {
      if (!isManager) return fail();

      const deleted = await this.client.db.Tag.destroy(
        { where: { name: { [this.client.db.Op.regexp]: tag as string } } }
      );

      return message.util.reply(`Done! **${deleted}** tags named similarly to **${tag}** has been deleted.`);
    }

    await (tag as Tag).destroy();

    return message.util.reply(`Done! tag **${(tag as Tag).name}** has been deleted.`);
  }
}
