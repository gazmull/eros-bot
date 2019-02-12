import { GuildMember } from 'discord.js';
import ErosCommand from '../../struct/command';
import ErosClient from '../../struct/ErosClient';

export default class extends ErosCommand {
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
    const client = this.client as ErosClient;
    const factory = client.db.Tag;

    if (member) {
      const memberTags = await factory.findAll({
        where: {
          authorId: member.id,
          guildId: message.guild.id
        }
      });

      if (!memberTags.length) {
        if (member.id !== message.author.id)
          return message.util.reply(`**${member.displayName}** has no tags here.`);

        return message.util.reply('... uh... yeah, no... you do not have one.');
      }

      const memberEmbed = this.util.embed(message)
        .setAuthor(`${member.user.tag} (${member.id})`)
        .setThumbnail(member.user.displayAvatarURL({ format: 'webp' }))
        .addField(
          `${member.displayName}${member.displayName.endsWith('s') ? '\'' : '\'s'} Pinned Tags`,
          memberTags
            .filter(el => el.hoisted)
            .map(el => `**\`${el.name}\`**`)
            .sort()
            .join(', ')
        )
        .addField(
          'Tags',
          memberTags
            .filter(el => !el.hoisted)
            .map(el => `**\`${el.name}\`**`)
            .sort()
            .join(', ')
        );

      return message.util.send(memberEmbed);
    }

    const tags = await factory.findAll({ where: { guildId: message.guild.id } });

    if (!tags.length) return message.util.send('We do not have any tag here. Be the first one to create one here!');

    const embed = this.util.embed(message)
      .setAuthor(`${message.guild} (${message.guild.id})`)
      .setThumbnail(message.guild.iconURL({ format: 'webp' }))
      .addField(
        'Pinned Tags',
        tags
          .filter(el => el.hoisted)
          .map(el => `**\`${el.name}\`**`)
          .sort()
          .join(', ')
      )
      .addField(
        `${message.member.displayName}${message.member.displayName.endsWith('s') ? '\'' : '\'s'} Tags`,
        tags
          .filter(el => el.authorId === message.author.id)
          .map(el => `**\`${el.name}\`**`)
          .sort()
          .join(', ')
      );

    return message.util.send(embed);
  }
}
