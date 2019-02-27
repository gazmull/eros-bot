import { ArgumentOptions, Control } from 'discord-akairo';
import { GuildMember } from 'discord.js';
import ErosCommand from '../../struct/command';
import { Tag } from '../../struct/models/factories/Tag';

const pageArg: ArgumentOptions = {
  id: 'page',
  type: 'integer',
  default: 1
};

export default class extends ErosCommand {
  constructor () {
    super('tag-leaderboard', {
      description: {
        content: 'Displays a leaderboard of tags from the current server or the specified member.',
        usage: '<member> [page number]'
      },
      noTrash: true,
      args: [
        Control.if(message => !isNaN(Number(message.util.parsed.content.split(/ +/g).slice(1)[0])),
          [ pageArg ], [
            {
              id: 'member',
              type: 'member'
            },
            pageArg,
          ]
        ),
      ]
    });
  }

  public async exec (message: Message, { member, page }: { member: GuildMember, page: number }) {
    try {
      const factory = this.client.db.Tag;
      const { emojis } = this.client.config;
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

        if (!memberTags.length) {
          if (member.id !== message.author.id)
            return message.util.reply(`**${member.displayName}** has no tags here.`);

          return message.util.reply('... uh... yeah, no... you do not have one.');
        }

        const memberEmbed = this.util.fields(message)
          .setTitle('Most Used Tags')
          .setAuthor(`${member.user.tag} (${member.id})`)
          .setThumbnail(member.user.displayAvatarURL({ format: 'webp' }))
          .setAuthorizedUsers([ message.author.id ])
          .setChannel(message.channel)
          .setClientMessage(message.util.lastResponse, `${emojis.loading} Preparing...`)
          .setArray(memberTags)
          .setTimeout(240 * 1000)
          .setPage(page)
          .addField('Help', [
            'React with the emoji below to navigate. ↗ to skip a page.',
            `See a tag's information with \`${prefix}\``,
          ])
          .formatField('#) Name', (el: Tag) => `${tags.findIndex(t => t.name === el.name) + 1} ${el.name}`)
          .formatField('Times Used', (el: Tag) => el.uses);

        return memberEmbed.build();
      }

      const tags = await factory.findAll({
        where: { guild: message.guild.id },
        order: [ [ 'uses', 'DESC' ] ],
        attributes: [ 'name', 'uses' ]
      });

      if (!tags.length) return message.util.send('We do not have any tag here. Be the first one to create one here!');

      const embed = this.util.fields(message)
        .setTitle('Most Used Tags')
        .setAuthor(`${message.guild.name} (${message.guild.id})`)
        .setThumbnail(message.guild.iconURL({ format: 'webp' }))
        .setAuthorizedUsers([ message.author.id ])
        .setChannel(message.channel)
        .setClientMessage(message.util.lastResponse, `${emojis.loading} Preparing...`)
        .setArray(tags)
        .setTimeout(240 * 1000)
        .setPage(page)
        .addField('Help', [
          'React with the emoji below to navigate. ↗ to skip a page.',
          `See a tag's information with \`${prefix}tag info <tag name>\``,
        ])
        .formatField('#) Name', (el: Tag) => `${tags.findIndex(t => t.name === el.name) + 1}) ${el.name}`)
        .formatField('Times Used', (el: Tag) => el.uses);

      return embed.build();
    } catch (err) { this.emitError(err, message, this); }
  }
}
