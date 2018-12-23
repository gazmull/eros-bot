const Command = require('../../struct/custom/Command');
const { get } = require('snekfetch');

const { url, emojis } = require('../../auth');

class SearchKamihimeCommand extends Command {
  constructor() {
    super('search', {
      aliases: ['search', 'get', 'find'],
      description: {
        content: 'Searches for characters matched with your input.',
        usage: '<character name>',
        examples: ['eros', 'mars']
      },
      paginated: true,
      args: [
        {
          id: 'character',
          match: 'text',
          type: word => {
            if (!word || word.length < 2) return null;

            return word;
          },
          prompt: {
            start: 'what input would you like to search for characters?',
            retry: 'please provide an input with 2 characters and above.'
          }
        },
        {
          id: 'advanced',
          match: 'flag',
          flag: ['--dev', '--advanced']
        },
        {
          id: 'isID',
          match: 'flag',
          flag: ['-i', '--id']
        }
      ]
    });
    this.apiURL = url.api;
  }

  async exec(message, { character, advanced, isID }) {
    try {
      await message.util.send(`${emojis.loading} Awaiting KamihimeDB's response...`);

      if (isID) return this.searchID(message, character);

      const data = await get(`${this.apiURL}search?name=${encodeURI(character)}`, { headers: { Accept: 'application/json' } });
      const result = data.body;

      if (result.length < 1) return message.util.edit('No results found.');

      const embed = this.util.paginationFields()
        .setAuthorizedUsers([message.author.id])
        .setChannel(message.channel)
        .setClientMessage(message.util.lastResponse, `${emojis.loading} Preparing...`)
        .setArray(result)
        .setTitle(`${character.toUpperCase()} | Found: ${result.length}`)
        .setColor(0xFF00AE)
        .showPageIndicator(false)
        .setTimeout(60 * 1000)
        .addField('Help', 'React with the emoji below to navigate. ↗ to skip a page.');

      if (advanced) embed.formatField('# - ID', i => `${result.indexOf(i) + 1} - ${i.id}`);
      embed.formatField('Name', i => i.name);

      return await embed.build();
    } catch (err) {
      return new this.client.APIError(message.util, err, 1);
    }
  }

  async searchID(message, character) {
    try {
      await get(`${this.apiURL}id/${character}`, { headers: { Accept: 'application/json' } });

      return message.util.edit(`ID ${character} does exist.`);
    } catch (err) {
      return message.util.edit(`ID ${character} does not exist.`);
    }
  }
}

module.exports = SearchKamihimeCommand;
