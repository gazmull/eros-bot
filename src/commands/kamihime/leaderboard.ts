import { Message, TextChannel } from 'discord.js';
import fetch from 'node-fetch';
import { IKamihimeDB } from '../../../typings';
import ErosCommand from '../../struct/command';

export default class extends ErosCommand {
  constructor () {
    super('leaderboard', {
      aliases: [ 'leaderboard', 'lb', 'toppeeks', 'top' ],
      description: {
        content: 'Displays leaderboard for top views on harem scenes from Kamihime Database.',
        usage: '[page number]',
        examples: [ '', '13', '37' ]
      },
      noTrash: true,
      args: [
        {
          id: 'page',
          type: 'integer',
          default: 1
        },
        {
          id: 'advanced',
          match: 'flag',
          flag: [ '-d', '--dev', '--advanced' ]
        },
      ]
    });
  }

  public async exec (message: Message, { page, advanced }: { page: number, advanced: boolean }) {
    try {
      const { emojis, url } = this.client.config;

      await message.util.send(`${emojis.loading} Awaiting Kamihime DB's response...`);

      const data = await fetch(`${url.api}list/approved`, { headers: { Accept: 'application/json' } });
      const characters = await data.json();

      if (characters.error) throw characters.error.message;

      let list: IKamihimeDB[] = characters.filter(c => c.peeks !== 0);
      list = list.sort((a, b) => b.peeks - a.peeks);

      const Pagination = this.util.fields<IKamihimeDB>(message)
        .setAuthorizedUsers([ message.author.id ])
        .setChannel(message.channel as TextChannel)
        .setClientAssets({ message: message.util.lastResponse, prepare: `${emojis.loading} Preparing...` })
        .setArray(list)
        .setPage(page)
        .setTimeout(240 * 1000);

      Pagination.embed
        .setTitle('Most Views Leaderboard (Harem Scenes)')
        .addField('Help', 'React with the emoji below to navigate. ↗ to skip a page.');

      if (advanced) Pagination.formatField('#) ID', i => `${list.indexOf(i) + 1}) ${i.id}`);

      Pagination
        .formatField(
          advanced
            ? 'Name'
            : '#) Name',
          i => `${advanced
            ? ''
            : `${list.indexOf(i) + 1}) `}${i.name}`
        )
        .formatField('Views', i => i.peeks);

      return Pagination.build();
    } catch (err) { this.emitError(err, message, this, 1); }
  }
}
