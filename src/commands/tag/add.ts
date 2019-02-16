import ErosCommand from '../../struct/command';
import ErosClient from '../../struct/ErosClient';

export default class extends ErosCommand {
  constructor () {
    super('tag-add', {
      description: {
        content: 'Adds a tag.',
        usage: '<tag name> <tag content> [--hoist]',
        examples: [ 'codes ***breathes heavily*** CODES', 'thisIsHoisted hoisted, sir --hoist' ]
      },
      args: [
        {
          id: 'name',
          type: 'existingTag',
          prompt: {
            start: 'what should the new tag be named?',
            retry: (_, __, input: { phrase: string }) =>
              `**${input.phrase}** already exists or it's too long. Please provide again.`
          }
        },
        {
          id: 'content',
          match: 'rest',
          type: 'tagContent',
          prompt: {
            start: 'what should the new tag contain?',
            retry: 'content should not be exceeding 1950 characters. Please provide again.'
          }
        },
        {
          id: 'hoisted',
          match: 'flag',
          flag: [ '-h', '--hoist', '-p', '--pin' ]
        },
      ]
    });
  }

  public async exec (
    message: Message,
    { name, content, hoisted }: { name: string, content: string, hoisted: boolean }
  ) {
    if (name.length > 256) {
      message.util.reply('why bother to name a tag too long?');

      return this.fail(message);
    }
    if (content.length > 1950) {
      message.util.reply('uh oh, your content exceeds the 2000 characters limit!');

      return this.fail(message);
    }

    const client = this.client as ErosClient;
    const isManager = message.member.hasPermission('MANAGE_GUILD');

    await client.db.Tag.create({
      author: message.author.id,
      content,
      guild: message.guild.id,
      hoisted: hoisted && isManager ? true : false,
      modifiedBy: message.author.id,
      name
    });

    return message.util.reply(`Done! tag **${name}** has been created.`);
  }
}
