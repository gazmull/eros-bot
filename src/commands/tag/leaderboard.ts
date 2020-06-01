import { GuildMember, Message, TextChannel } from 'discord.js';
import Command from '../../struct/command';
import { Tag } from '../../struct/models/Tag';

export default class extends Command {
  constructor () {
    super('tag-leaderboard', {
      description: {
        content: 'Displays a leaderboard of tags from the current server or the specified member.',
        usage: '<member> [page number]'
      },
      noTrash: true
    });
  }

  public * args (message: Message) {
    const member = isNaN(Number(message.util.parsed.content.split(/ +/g).slice(1)[0]))
      ? yield { type: 'member' }
      : null;

    const page = yield {
      type: 'integer',
      default: 1
    };

    return { member, page };
  }

  public async exec (message: Message, { member, page }: { member: GuildMember, page: number }) {
    const factory = this.client.db.Tag;
    const prefix = await this.handler.prefix(message);

    if (member) {
      const memberTags = await factory.findAll({
        where: {
          author: member.id,
          guild: message.guild.id
        },
        order: [ [ 'uses', 'DESC' ] ],
        attributes: [ 'name', 'uses' ]
      });

      if (!memberTags.length)
        return message.util.reply(
          member.id !== message.author.id
            ? `**${member.displayName}** has no tags here.`
            : '... uh... yeah, no... you do not have one.'
        );

      const memberEmbed = this.client.fields<Tag>(message)
        .setAuthorizedUsers(message.author.id)
        .setChannel(message.channel as TextChannel)
        .setClientAssets({ message: message.util.lastResponse })
        .setArray(memberTags)
        .setPage(page);

      memberEmbed.embed.addField('Help', [
        'React with the emoji below to navigate. ↗ to skip a page.',
        `See a tag's information with \`${prefix}\``,
      ]);
      memberEmbed
        .formatField('#) Name', el => `${tags.findIndex(t => t.name === el.name) + 1} ${el.name}`)
        .formatField('Times Used', el => el.uses);

      return memberEmbed.build();
    }

    const tags = await factory.findAll({
      where: { guild: message.guild.id },
      order: [ [ 'uses', 'DESC' ] ],
      attributes: [ 'name', 'uses' ]
    });

    if (!tags.length) return message.util.send('We do not have any tag here. Be the first one to create one here!');

    const serverEmbed = this.client.fields<Tag>(message)
      .setAuthorizedUsers(message.author.id)
      .setChannel(message.channel as TextChannel)
      .setClientAssets({ message: message.util.lastResponse })
      .setArray(tags)
      .setPage(page);

    serverEmbed.embed
      .setTitle('Most Used Tags')
      .setAuthor(`${message.guild.name} (${message.guild.id})`)
      .setThumbnail(message.guild.iconURL({ format: 'webp' }))
      .addField('Help', [
        'React with the emoji below to navigate. ↗ to skip a page.',
        `See a tag's information with \`${prefix}tag info <tag name>\``,
      ]);
    serverEmbed
      .formatField('#) Name', el => `${tags.findIndex(t => t.name === el.name) + 1}) ${el.name}`)
      .formatField('Times Used', el => el.uses);

    return serverEmbed.build();
  }
}
