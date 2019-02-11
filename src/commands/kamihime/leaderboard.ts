import fetch from 'node-fetch';
// @ts-ignore
import { emojis, url } from '../../../auth';
import Command from '../../struct/command/Command';

export default class extends Command {
  constructor () {
    super('leaderboard', {
      aliases: [ 'leaderboard', 'lb', 'toppeeks', 'top' ],
      description: {
        content: 'Displays leaderboard of kamihime for top views on harem scenes.',
        usage: '<page number>',
        examples: [ '', '13', '37' ]
      },
      lock: 'user',
      paginated: true,
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

  public async exec (message, { page, advanced }) {
    try {
      await message.util.send(`${emojis.loading} Awaiting Kamihime DB's response...`);

      const data = await fetch(`${url.api}list/approved`, { headers: { Accept: 'application/json' } });
      const characters = await data.json();

      if (characters.error) throw characters.error.message;

      let list = characters.filter(c => c.peeks !== 0);
      list = list.sort((a, b) => b.peeks - a.peeks);

      const embed = this.util.fields(message)
        .setAuthorizedUsers([ message.author.id ])
        .setChannel(message.channel)
        .setClientMessage(message.util.lastResponse, `${emojis.loading} Preparing...`)
        .setArray(list)
        .setPage(page)
        .setTitle('Most Views Leaderboard (Harem Scenes)')
        .setTimeout(240 * 1000)
        .addField('Help', 'React with the emoji below to navigate. ↗ to skip a page.');

      if (advanced) embed.formatField('#) ID', i => `${list.indexOf(i) + 1}) ${i.id}`);
      embed
        .formatField(
          advanced
            ? 'Name'
            : '#) Name',
          i => `${advanced
            ? ''
            : `${list.indexOf(i) + 1}) `}${i.name}`
        )
        .formatField('Views', i => i.peeks);

      return await embed.build();
    } catch (err) { this.emitError(err, message, this, 1); }
  }
}
