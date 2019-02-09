import { PrefixSupplier } from 'discord-akairo';
import fetch from 'node-fetch';
import { emojis, url } from '../../../auth';
import Command from '../../struct/command/Command';

export default class extends Command {
  constructor () {
    super('list', {
      aliases: [ 'list', 'l' ],
      description: {
        content: [
          'Displays results based on your arguments.',
          'See `list variables` for a list of available variables.',
          '**NOTE**: Results are only from Harem Database.',
        ].join('\n'),
        usage: '<filter variable>',
        examples: [ 'kamihime', 'eidolon', 'eidolon dark' ]
      },
      cooldown: 5 * 1000,
      lock: 'user',
      paginated: true,
      args: [
        {
          id: 'filter',
          match: 'text',
          prompt: {
            start: [
              'how do you want to filter a list of results?',
              'Say `variables` for a list of available filter variables.',
            ]
          }
        },
        {
          id: 'advanced',
          match: 'flag',
          flag: [ '-d', '--dev', '--advanced' ]
        },
      ]
    });
  }

  public async exec (message: Message, { filter, advanced }) {
    try {
      if (filter.toLowerCase() === 'variables') return await this.helpDialog(message);
      const lastResponse = await message.util.send(`${emojis.loading} Awaiting Kamihime DB's response...`);

      const args = filter.toLowerCase().trim().split(/ +/g);
      const rawData = await fetch(`${url.api}list/${args.join('/')}`, { headers: { Accept: 'application/json' } });
      const result = await rawData.json();

      if (result.error) throw result.error.message;

      const embed = this.util.fields()
        .setAuthorizedUsers([ message.author.id ])
        .setChannel(message.channel)
        .setClientMessage(lastResponse, `${emojis.loading} Preparing...`)
        .setArray(result)
        .setTitle(`${filter.toUpperCase()} | Found: ${result.length}`)
        .setDescription([
          '**NOTE**: This is a list of characters registered in',
          '[**Kamihime Database**](http://kamihimedb.thegzm.space) only.',
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
    } catch (err) { this.emitError(err, message, this, 1); }
  }

  public helpDialog (message: Message) {
    const prefix = (this.handler.prefix as PrefixSupplier)(message);
    const embed = this.client.util.embed()
      .setTitle('Filter Variables')
      .setColor(0xFF00AE)
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
      ]);

    return message.util.send({ embed });
  }
}