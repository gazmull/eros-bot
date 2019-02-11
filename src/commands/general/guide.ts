import { PrefixSupplier } from 'discord-akairo';
import { StringResolvable } from 'discord.js';
// @ts-ignore
import { emojis } from '../../../auth';
import Command from '../../struct/command/Command';
import { dialogs } from './guide-pages';

export default class extends Command {
  constructor () {
    super('guide', {
      aliases: [ 'guide' ],
      description: {
        content: 'Displays guide for using this bot and other game-related information.',
        usage: '<page number>',
        examples: [ '', '13', '37' ]
      },
      paginated: true,
      args: [
        {
          id: 'page',
          type: 'integer',
          default: 1
        },
      ]
    });
  }

  public async exec (message: Message, { page }) {
    const embeds = dialogs.map(v => {
      const title = v.command ? `Command: ${v.command.toUpperCase()}` : v.title;
      let description: StringResolvable = v.description || '';

      if (v.command) {
        const command = this.handler.findCommand(v.command);

        if (command)
          description = [
            `**Usage**: \`@Eros ${v.command} ${command.description.usage}\``,
            '**Aliases**: ' + command.aliases.map(c => `\`${c}\``).join(', '),
            '**Brief Description**: ' + command.description.content,
            '',
            ...description,
          ];
      }

      const embed = this.util.embed()
        .setTitle(title)
        .setDescription(description)
        .setImage(v.image);

      if (v.fields)
        for (const field of v.fields)
          embed.addField(field.name, field.value, field.inline || false);

      if (v.contributors)
        embed
          .addBlankField()
          .addField('Contributors', v.contributors.join(', '));

      return embed;
    });
    const longest = dialogs.reduce((long, d) => {
      const title = d.command ? `Command: ${d.command.toUpperCase()}` : d.title;

      return Math.max(long, title.length);
    }, 0);
    const tableOfContents = this.util.embed()
      .setTitle('Table of Contents (Pages)')
      .setDescription([
        '```asciidoc',
        dialogs
          .map((v, i) => {
            const title = v.command ? `Command: ${v.command.toUpperCase()}` : v.title;
            const space = ' '.repeat(longest - title.length);

            return `${title}${space} :: ${i + 2}`;
          })
          .join('\n'),
        '```',
      ])
      .addField('Navigation Tip', [
        'React with the emoji below to navigate. ↗ to skip a page.',
        `You may also do \`${
          (this.handler.prefix as PrefixSupplier)(message)}guide <page number>\` to jump to a page immediately.`,
      ]);

    embeds.unshift(tableOfContents);

    return this.util.embeds(message)
      .setAuthorizedUsers([ message.author.id ])
      .setChannel(message.channel)
      .setClientMessage(null, `${emojis.loading} Preparing...`)
      .setArray(embeds)
      .setPage(page)
      .setTimeout(240 * 1000)
      .showPageIndicator(true)
      .build();
  }
}
