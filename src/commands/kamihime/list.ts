import { Message } from 'discord.js';
import fetch from 'node-fetch';
import { IKamihimeDB } from '../../../typings';
import Command from '../../struct/command';

export default class extends Command {
  constructor () {
    super('list', {
      aliases: [ 'list', 'l' ],
      description: {
        content: 'Displays character/weapon names based on your arguments.',
        usage: '<filter variables> [--sort=<by>-[asc/desc]]',
        examples: [ 'kamihime', 'eidolon', 'eidolon dark', 'kamihime ssr --sort=ttl', 'kamihime ssr --sort=ttl-desc' ]
      },
      cooldown: 5 * 1000,
      lock: 'user',
      noTrash: true,
      args: [
        {
          id: 'filter',
          type: 'lowercase',
          match: 'text',
          prompt: {
            start: [
              'how do you want to filter a list of items?',
              'Say `variables` for a list of available filter variables.',
            ]
          }
        },
        {
          id: 'advanced',
          match: 'flag',
          flag: [ '-d', '--dev', '--advanced' ]
        },
        {
          id: 'sort',
          match: 'option',
          flag: [ '-s', '--sort=' ],
          type: /^(?:name|rarity|tier|element|type|atk|hp|ttl)(?:-desc)?$/i,
          default: [ 'name' ]
        },
      ]
    });
  }

  public async exec (
    message: Message,
    { filter, advanced, sort: sortMatches }: { filter: string, advanced: boolean, sort: RegExpMatchArray }
  ) {
    try {
      if (filter === 'variables') return this.helpDialog(message);

      const { emojis, url } = this.client.config;
      await message.util.send(`${emojis.loading} Awaiting Kamihime DB's response...`);

      const sort = sortMatches.shift().toLowerCase();
      const args = filter.trim().split(/ +/g).join('/');
      const isTtl = /^ttl/.test(sort);
      const query = sort && !isTtl ? `?sort=${sort}` : '';
      const rawData = await fetch(`${url.api}list/${args}${query}`, { headers: { Accept: 'application/json' } });
      const result: IKamihimeDB[] = await rawData.json();

      if ((result as any).error) throw (result as any).error.message;
      if (!result.length) throw RangeError(`There are no matching items found with ${filter.toUpperCase()}`);

      const [ sortBy, sortType = 'asc' ] = sort.split('-');
      const sorted = isTtl
        ? result
          .sort((a, b) =>
            sortType === 'desc'
              ? (b.atk + b.hp) - (a.atk + a.hp)
              : (a.atk + a.hp) - (b.atk + b.hp)
          )
          .map(v => ({ name: v.name, id: v.id, ttl: v.atk + v.hp })) as unknown as IKamihimeDB[]
        : result;

      const Pagination = this.client.fields<IKamihimeDB>(message)
        .setAuthorizedUsers([ message.author.id ])
        .setChannel(message.channel)
        .setClientAssets({ message: message.util.lastResponse })
        .setArray(sorted);

      Pagination.embed
        .setTitle(`${filter.toUpperCase()} | Found: ${result.length}`)
        .setDescription([
          '**NOTE**: This is a list of characters registered in',
          `[**Kamihime Database**](${url.root}) only.`,
        ].join(' '))
        .addField('Help', 'React with the emoji below to navigate. ↗ to skip a page.');

      if (advanced) Pagination.formatField('# - ID', i => `${result.indexOf(i) + 1} - ${i.id}`, true);

      Pagination
        .formatField(
          `${advanced ? '' : '# - '}Name`, i => `${advanced ? '' : `${result.indexOf(i) + 1} - `}${i.name}`,
          true
        );

      if (!/^name/.test(sort)) Pagination.formatField(sort.toUpperCase(), i => i[sortBy]);

      return Pagination.build();
    } catch (err) { this.handler.emitError(err, message, this, 1); }
  }

  public async helpDialog (message: Message) {
    const prefix = await this.handler.prefix(message);
    const embed = this.client.embed(message)
      .setTitle('Filter Variables')
      .setDescription(
        [
          '__At least one Primary Variable is required__',
          `\nExamples: \`${prefix}list kamihime\`, `,
          `\`${prefix}list kamihime offense\`, or`,
          `\`${prefix}list kamihime offense fire\``,
        ].join(' ')
      )
      .addField('Primary Variable', [ 'soul', 'eidolon', 'kamihime', 'weapon', 'approved', 'loli', 'no-loli' ], true)
      .addField('Description', [
        'Souls Only', 'Eidolons Only', 'Kamihime Only', 'Weapon Only',
        'Approved Only', 'Loli Only', 'Big Sisters Only',
      ], true)
      .addBlankField(true)
      .addField('Secondary Variables', [
        '**Souls**\n\tlegendary, elite, standard',
        '**Eidolons/Kamihime**\n\tfire, water, wind, thunder, dark, light, phantom\n\tr, sr, ssr, ssr+',
        '**Souls/Kamihime**\n\toffense, defense, balance, tricky, healer',
      ])
      .addBlankField()
      .addField('Options for --sort= Flag', [
        [
          'Default is by name. Other options are:',
          [ 'name', 'rarity', 'tier', 'element', 'type', 'atk', 'hp', 'ttl' ]
            .map(el => `\`${el}\``)
            .join(', '),
          'Append `-asc` or `-desc` to sort by <type> `Ascending` or `Descending` respectively. (e.g: `rarity-desc`)',
        ],
      ]);

    return message.util.send(embed);
  }
}
