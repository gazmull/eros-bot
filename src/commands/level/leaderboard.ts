import ErosCommand from '../../struct/command';
import { ILevelInstance } from '../../struct/models/factories/level';

export default class extends ErosCommand {
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
    try {
      const factory = this.client.db.Level;
      const { emojis } = this.client.config;

      const levels = await factory.findAll({
        where: { guild: message.guild.id },
        order: [ [ 'exp', 'DESC' ] ],
        attributes: [ 'user', 'exp' ]
      });

      if (!levels.length) return message.util.send('Looks like this is a ghost guild...');

      const embed = this.util.fields(message)
        .setTitle('Highest Level Members')
        .setAuthor(`${message.guild.name} (${message.guild.id})`)
        .setThumbnail(message.guild.iconURL({ format: 'webp' }))
        .setAuthorizedUsers([ message.author.id ])
        .setChannel(message.channel)
        .setClientMessage(message.util.lastResponse, `${emojis.loading} Preparing...`)
        .setArray(levels)
        .setTimeout(240 * 1000)
        .setPage(page)
        .addField('Help', [
          'React with the emoji below to navigate. ↗ to skip a page.',
          `See a members's information with \`${await this.handler.prefix(message)}level info <member>\``,
        ])
        .formatField(
          '#) Name',
          (el: ILevelInstance) => {
            const user = this.client.users.get(el.user);
            const tag = user ? user.tag : 'UNKNOWN_USER';

            return `${levels.findIndex(l => l.user === el.user) + 1}) ${tag}`;
          }
        )
        .formatField('EXP', (el: ILevelInstance) => el.exp);

      return embed.build();
    } catch (err) { this.emitError(err, message, this); }
  }
}
