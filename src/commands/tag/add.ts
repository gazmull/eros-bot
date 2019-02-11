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
      channel: 'guild',
      ratelimit: 2,
      lock: 'user',
      args: [
        {
          id: 'name',
          type: 'existingTag',
          prompt: {
            start: 'what should the future tag be named?',
            retry: (message: Message, input: { phrase: string }) => {
              return input.phrase
                ? `${message.author}, **${input.phrase}** already exists or it's too long. Please provide again.`
                : `${message.author}, Please provide a name!`;
            }
          }
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
    if (name && name.length > 256) {
      message.util.reply('why bother to name a tag too long?');

      return this.fail(message);
    }
    if (content && content.length > 1950) {
      message.util.reply('uh oh, your content exceeds the 2000 characters limit!');

      return this.fail(message);
    }

    const client = this.client as ErosClient;
    const isManager = message.member.hasPermission('MANAGE_GUILD');

    await client.db.Tag.create({
      authorId: message.author.id,
      content,
      guildId: message.guild.id,
      hoisted: hoisted && isManager ? true : false,
      modifiedBy: message.author.id,
      name
    });

    return message.util.reply(`Done! tag **${name}** has been created.`);
  }
}
