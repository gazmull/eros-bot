import ErosCommand from '../../struct/command';
import ErosClient from '../../struct/ErosClient';

export default class extends ErosCommand {
  constructor () {
    super('tag-show', {
      description: {
        content: 'Displays a tag.',
        usage: '<tag name>'
      },
      channel: 'guild',
      ratelimit: 2,
      lock: 'user',
      args: [
        {
          id: 'name',
          match: 'content',
          type: name => {
            if (!name || name.length < 1) return null;

            return name;
          },
          prompt: { start: 'what is the name of the tag?' }
        },
      ]
    });
  }

  public async exec (message: Message, { name }: { name: string }) {
    if (!name) return;

    const client = this.client as ErosClient;
    const tag = await client.db.Tag.findOne({
      where: {
        name,
        guildId: message.guild.id
      }
    });

    if (!tag) return;

    await client.db.Tag.update({ uses: ++tag.uses }, {
      where: {
        name,
        guildId: message.guild.id
      }
    });

    return message.util.send(tag.content);
  }
}
