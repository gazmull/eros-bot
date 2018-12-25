const Command = require('../../struct/custom/Command');
const { get } = require('snekfetch');

const { loading } = require('../../auth').emojis;
const { api } = require('../../auth').url;

class ListCommand extends Command {
  constructor() {
    super('list', {
      aliases: ['list', 'l'],
      description: {
        content: [
          'Displays results based on your arguments.',
          'See `list variables` for a list of available variables.',
          '**NOTE**: Results are only from Harem Database.'
        ].join('\n'),
        usage: '<filter variable>',
        examples: ['kamihime', 'eidolon', 'eidolon dark']
      },
      cooldown: 5 * 1000,
      paginated: true,
      args: [
        {
          id: 'filter',
          match: 'text',
          prompt: {
            start: [
              'how do you want to filter a list of results?',
              'Say `variables` for a list of available filter variables.'
            ]
          }
        },
        {
          id: 'advanced',
          match: 'flag',
          flag: ['--dev', '--advanced']
        }
      ]
    });
    this.apiURL = api;
    this.fields = {
      soul: ['type', 'tier'],
      eidolon: ['element', 'rarity'],
      kamihime: ['element', 'type', 'rarity']
    };
  }

  async exec(message, { filter, advanced }) {
    try {
      if (filter.toLowerCase() === 'variables') return await this.helpDialog(message);
      const lastResponse = await message.util.send(`${loading} Awaiting Kamihime DB's response...`);

      const args = filter.toLowerCase().trim().split(/ +/g);
      const rawData = await get(`${this.apiURL}list/${args.join('/')}`, { headers: { Accept: 'application/json' } });
      const result = rawData.body;

      if (!result.length) return message.util.edit('Nothing found with such variable.');

      const embed = this.util.paginationFields()
        .setAuthorizedUsers([message.author.id])
        .setChannel(message.channel)
        .setClientMessage(lastResponse, `${loading} Preparing...`)
        .setArray(result)
        .setTitle(`${filter.toUpperCase()} | Found: ${result.length}`)
        .setDescription([
          '**NOTE**: This is a list of characters registered in',
          '[**Kamihime Database**](http://kamihimedb.thegzm.space) only.'
        ].join(' '))
        .setColor(0xFF00AE)
        .setTimeout(240 * 1000)
        .addField('Help', 'React with the emoji below to navigate. ↗ to skip a page.');

      if (advanced) embed.formatField('# - ID', i => `${result.indexOf(i) + 1} - ${i.id}`, true);
      embed.formatField(
        `${advanced ? '' : '# - '}Name`, i => `${advanced ? '' : `${result.indexOf(i) + 1} - `}${i.name}`,
        true
      );

      await embed.build();
    } catch (err) {
      return new this.client.APIError(message.util, err, 1);
    }
  }

  helpDialog(message) {
    const embed = this.client.util.embed()
      .setTitle('Filter Variables')
      .setColor(0xFF00AE)
      .setDescription(
        [
          `Examples: \`${this.handler.prefix(message)}list kamihime\`, `,
          `\`${this.handler.prefix(message)}list kamihime offense\`, or`,
          `\`${this.handler.prefix(message)}list kamihime offense fire\``
        ].join(' ')
      )
      .addField('Primary Variable', ['soul', 'eidolon', 'kamihime', 'weapon', 'approved', 'loli'], true)
      .addField('Description', ['Souls Only', 'Eidolons Only', 'Kamihime Only', 'Weapon Only', 'Approved Only', 'Loli Only'], true)
      .addBlankField(true)
      .addField('Secondary Variables', [
        '**Souls**\n\tlegendary, elite, standard',
        '**Eidolons/Kamihime**\n\tfire, water, wind, thunder, dark, light, phantom\n\tr, sr, ssr, ssr+',
        '**Souls/Kamihime**\n\toffense, defense, balance, tricky, healer'
      ]);

    return message.util.send({ embed });
  }
}

module.exports = ListCommand;
