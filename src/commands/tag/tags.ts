import { GuildMember, Message } from 'discord.js';
import Command from '../../struct/command';

export default class extends Command {
  constructor () {
    super('tag-list', {
      aliases: [ 'tags' ],
      description: {
        content: 'Displays a list of tags from the current server or the specified member.',
        usage: '[member name]'
      },
      channel: 'guild',
      ratelimit: 2,
      args: [
        {
          id: 'member',
          type: 'member'
        },
      ]
    });
  }

  public async exec (message: Message, { member }: { member: GuildMember }) {
    const factory = this.client.db.Tag;
    const replyFail = async () =>
      message.util.reply(
        `list is too long... please do use \`${await this.handler.prefix(message)}tag search\` instead.`
      );

    if (member) {
      const memberTags = await factory.findAll({
        where: {
          author: member.id,
          guild: message.guild.id
        },
        attributes: [ 'id', 'name', 'hoisted' ]
      });

      if (!memberTags.length) {
        if (member.id !== message.author.id)
          return message.util.reply(`**${member.displayName}** has no tags here.`);

        return message.util.reply('... uh... yeah, no... you do not have one.');
      } else if (memberTags.length > 69)
        return replyFail();

      const memberEmbed = this.client.embed(message)
        .setAuthor(`${member.user.tag} (${member.id})`)
        .setThumbnail(member.user.displayAvatarURL({ format: 'webp' }));

      const hoisted = memberTags.filter(el => el.hoisted);

      if (hoisted.length)
        memberEmbed.addField(
          `${member.displayName}${member.displayName.endsWith('s') ? '\'' : '\'s'} Pinned Tags`,
          hoisted
            .map(el => `**\`${el.name}\`**`)
            .sort()
            .join(', ')
        );

      memberEmbed.addField(
        'Tags',
        memberTags
          .map(el => `**\`${el.name}\`**`)
          .sort()
          .join(', ')
      );

      return message.util.send(memberEmbed);
    }

    const tags = await factory.findAll({
      where: { guild: message.guild.id },
      attributes: [ 'id', 'name', 'hoisted' ]
    });

    if (!tags.length) return message.util.send('We do not have any tag here. Be the first one to create one here!');
    else if (tags.length > 69)
      return replyFail();

    const embed = this.client.embed(message)
      .setAuthor(`${message.guild} (${message.guild.id})`)
      .setThumbnail(message.guild.iconURL({ format: 'webp' }));

    const serverHoisted = tags.filter(el => el.hoisted);
    const serverNotHoisted = tags.filter(el => !el.hoisted);

    embed.addField(
      'Server Tags', [
        ...serverHoisted
          .map(el => `**\`${el.name}\`**`)
          .sort(),
        ...serverNotHoisted
          .map(el => `**\`${el.name}\`**`)
          .sort(),
      ].join(', ')
    );

    const myTags = tags.filter(el => el.author === message.author.id);

    if (myTags.length)
      embed.addField(
        `${message.member.displayName}${message.member.displayName.endsWith('s') ? '\'' : '\'s'} Tags`,
        myTags
          .map(el => `**\`${el.name}\`**`)
          .sort()
          .join(', ')
      );

    return message.util.send(embed);
  }
}
