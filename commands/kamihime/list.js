const { Command } = require('discord-akairo');
const { get } = require('snekfetch');

const { loading } = require('../../auth').emojis;
const { api } = require('../../auth').url;
const { error } = require('../../utils/console');
const PaginationEmbed = require('discord-paginationembed').FieldsEmbed;

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
      clientPermissions: ['ADD_REACTIONS', 'MANAGE_MESSAGES', 'EMBED_LINKS'],
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
          prefix: ['--dev', '--advanced']
        }
      ]
    });
    this.paginated = true;
    this.apiURL = api;
    this.fields = {
      soul: ['khType', 'khTier'],
      eidolon: ['khElement', 'khRarity'],
      kamihime: ['khElement', 'khType', 'khRarity']
    };
  }

  async exec(message, { filter, advanced }) {
    try {
      if (filter.toLowerCase() === 'variables') return await this.helpDialog(message);
      const lastResponse = await message.util.send(`${loading} Awaiting Kamihime DB's response...`);

      const args = filter.toLowerCase().trim().split(/ +/g);
      const rawData = await get(`${this.apiURL}list`);
      let result = rawData.body;
      result = this.toCollection(result[args[0]]);

      if (!result.size) return message.util.edit('Nothing found with such variable.');

      if (args.slice(1).length)
        for (let i = 1; i < args.length; i++)
          result = result.filter(item => {
            const condition = [];
            for (const field in this.fields[args[0]]) {
              if (condition.length) condition.push('||');

              condition.push(`'${item[this.fields[args[0]][field]].toLowerCase()}' === '${args[i]}'`);
            }

            return eval(condition.join(' '));
          });

      if (!result.size) return message.util.edit('Nothing found with such variable(s).');

      result = this.toArray(result);

      const embed = new PaginationEmbed()
        .setAuthorizedUser(message.author)
        .setChannel(message.channel)
        .setClientMessage(lastResponse, `${loading} Preparing...`)
        .setArray(result)
        .setTitle(`${filter.toUpperCase()} | Found: ${result.length}`)
        .setDescription([
          '**NOTE**: This is a list of characters registered in',
          '[**Harem Scenes Database**](http://kamihimedb.thegzm.space) only.'
        ].join(' '))
        .setColor(0xFF00AE)
        .setTimeout(240 * 1000)
        .addField('Help', 'React with the emoji below to navigate. ↗ to skip a page.');

      if (advanced) embed.formatField('# - ID', i => `${result.indexOf(i) + 1} - ${i.khID}`, true);
      embed.formatField(
        `${advanced ? '' : '# - '}Name`, i => `${advanced ? '' : `${result.indexOf(i) + 1} - `}${i.khName}`,
        true
      );

      await embed.build();
    } catch (err) {
      if (err.stack)
        error(err.stack);

      return message.util.edit(`I cannot complete the query because:\n\`\`\`x1\n${err.message}\`\`\``);
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
      .addField('Primary Variable', ['soul', 'eidolon', 'kamihime'], true)
      .addField('Description', ['Souls Only', 'Eidolons Only', 'Kamihime Only'], true)
      .addBlankField(true)
      .addField('Secondary Variables', [
        '**Souls**\n\tlegendary, elite, standard',
        '**Eidolons/Kamihime**\n\tfire, water, wind, thunder, dark, light, phantom\n\tr, sr, ssr, ssra',
        '**Souls/Kamihime**\n\toffense, defense, balance, tricky, healer'
      ]);

    return message.util.send({ embed });
  }

  toCollection(result) {
    const collection = this.client.util.collection();
    for (const item in result)
      collection.set(result[item].khID, result[item]);

    return collection;
  }

  toArray(result) {
    const array = [];
    for (const [k, v] of result) // eslint-disable-line no-unused-vars
      array.push(v);

    return array;
  }
}

module.exports = ListCommand;
