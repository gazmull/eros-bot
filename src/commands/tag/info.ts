import { User } from 'discord.js';
import * as moment from 'moment-timezone';
import ErosCommand from '../../struct/command';
import { ITagInstance } from '../../struct/models/tag';

export default class extends ErosCommand {
  constructor () {
    super('tag-info', {
      description: {
        content: 'Display a tag\'s info.',
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
            retry: (message: Message, input: { phrase: string }) =>
              `${message.author}, **${input.phrase}** does not exist. Please provide again.`
          }
        },
      ]
    });
  }

  public async exec (message: Message, { tag }: { tag: ITagInstance }) {
    const user = await this.client.users.fetch(tag.authorId);
    let modifiedBy: User;

    if (tag.authorId === tag.modifiedBy) modifiedBy = user;
    else
      try { modifiedBy = await this.client.users.fetch(tag.modifiedBy); }
      catch { modifiedBy = null; }

    const embed = this.util.embed(message)
      .setTitle('Tag: ' + tag.name)
      .addField('Created By', user ? `${user.tag} (${user.id})` : 'Cannot resolve user',  true)
      .addField('Created At', moment.utc(tag.createdAt).format('DD/MM/YYYY hh:mm:ss'), true)
      .addField('Updated At', moment.utc(tag.updatedAt).format('DD/MM/YYYY hh:mm:ss'), true)
      .addField('Times Used', tag.uses);

    if (modifiedBy) embed.addField('Last Updated By', `${modifiedBy.tag} (${modifiedBy.id})`);

    return message.util.send(embed);
  }
}
