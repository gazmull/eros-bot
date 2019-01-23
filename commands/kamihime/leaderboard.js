const Command = require('../../struct/custom/Command');
const fetch = require('node-fetch');

const { emojis, url } = require('../../auth');

class LeaderboardKamihimeCommand extends Command {
  constructor() {
    super('leaderboard', {
      aliases: ['leaderboard', 'lb', 'toppeeks', 'top'],
      description: {
        content: 'Displays leaderboard of kamihime for top views on harem scenes.',
        usage: '<page number>',
        examples: ['', '13', '37']
      },
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
          flag: ['--dev', '--advanced']
        }
      ]
    });
    this.apiURL = url.api;
    this.loading = emojis.loading;
  }

  async exec(message, { page, advanced }) {
    try {
      await message.util.send(`${this.loading} Awaiting Kamihime DB's response...`);

      const data = await fetch(`${this.apiURL}list/approved`, { headers: { Accept: 'application/json' } });
      const characters = await data.json();

      if (characters.error) throw characters.error.message;

      let list = characters.filter(c => c.peeks !== 0);
      list = list.sort((a, b) => b.peeks - a.peeks);

      const embed = this.util.paginationFields()
        .setAuthorizedUsers([message.author.id])
        .setChannel(message.channel)
        .setClientMessage(message.util.lastResponse, `${this.loading} Preparing...`)
        .setArray(list)
        .setPage(page)
        .setTitle('Most Views Leaderboard (Harem Scenes)')
        .setColor(0xFF00AE)
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
    } catch (err) {
      return new this.client.APIError(message.util, err, 1);
    }
  }
}

module.exports = LeaderboardKamihimeCommand;
