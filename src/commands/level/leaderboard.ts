import { Message, TextChannel } from 'discord.js';
import Command from '../../struct/command';
import { Level } from '../../struct/models/Level';

export default class extends Command {
  constructor () {
    super('level-leaderboard', {
      description: {
        content: 'Displays a leaderboard of member levels from the current server.',
        usage: '[page number]'
      },
      noTrash: true,
      args: [
        {
          id: 'page',
          type: 'integer',
          default: 1
        },
      ]
    });
  }

  public async exec (message: Message, { page }: { page: number }) {
    const factory = this.client.db.Level;
    const { emojis } = this.client.config;

    const levels = await factory.findAll({
      where: { guild: message.guild.id },
      order: [ [ 'exp', 'DESC' ] ],
      attributes: [ 'user', 'exp' ]
    });

    if (!levels.length) return message.util.send('Looks like this is a ghost guild...');

    const Pagination = this.client.fields<Level>(message)
      .setAuthorizedUsers([ message.author.id ])
      .setChannel(message.channel as TextChannel)
      .setClientAssets({ message: message.util.lastResponse, prepare: `${emojis.loading} Preparing...` })
      .setArray(levels)
      .setPage(page);

    Pagination.embed
      .setTitle('Highest Level Members')
      .setAuthor(`${message.guild.name} (${message.guild.id})`)
      .setThumbnail(message.guild.iconURL({ format: 'webp' }))
      .addField('Help', [
        'React with the emoji below to navigate. ↗ to skip a page.',
        `See a members's information with \`${await this.handler.prefix(message)}level info <member>\``,
      ]);

    Pagination
      .formatField(
        '#) Name',
        el => {
          const user = this.client.users.get(el.user);
          const tag = user ? user.tag : 'UNKNOWN_USER';

          return `${levels.findIndex(l => l.user === el.user) + 1}) ${tag}`;
        }
      )
      .formatField('EXP', el => el.exp);

    return Pagination.build();
  }
}
