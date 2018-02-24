const { Command } = require('discord-akairo');
const { get } = require('snekfetch');

const PaginationEmbed = require('../../utils/PaginationEmbed');
const { error } = require('../../utils/console');

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
      clientPermissions: ['EMBED_LINKS'],
      args: [
        {
          id: 'character',
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
          prefix: ['--dev', '--advanced']
        }
      ]
    });
    this.apiURL = url.api;
    this.paginated = true;
  }

  async exec(message, { character, advanced }) {
    try {
      await message.util.send(`${emojis.loading} Awaiting KamihimeDB's response...`);
      const data = await get(`${this.apiURL}search?name=${encodeURI(character)}`);
      const result = data.body;

      if (result.length < 1) return message.util.edit('No results found.');

      const embed = new PaginationEmbed()
        .setAuthorisedUser(message.author)
        .setChannel(message.channel)
        .setClientMessage(message.util.lastResponse, `${emojis.loading} Preparing...`)
        .setArray(result)
        .setTitle(`${character.toUpperCase()} | Found: ${result.length}`)
        .setColor(0xFF00AE)
        .showPageIndicator(false);

      if (advanced) embed.formatField('# - ID', i => `${result.indexOf(i) + 1} - ${i.khID}`);
      embed.formatField('Name', i => i.khName);

      return await embed.build();
    } catch (err) {
      if (err.stack)
        error(err.stack);

      return message.util.edit(`I cannot complete the query because:\`\`\`\n${err.message}\`\`\`Step: KamihimeDB`);
    }
  }
}

module.exports = SearchKamihimeCommand;