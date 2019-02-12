import { PrefixSupplier } from 'discord-akairo';
import { StringResolvable } from 'discord.js';
// @ts-ignore
import { emojis } from '../../../auth';
import Command from '../../struct/command';

export default class extends Command {
  constructor () {
    super('guide', {
      aliases: [ 'guide' ],
      description: {
        content: 'Displays guide for using this bot and other game-related information.',
        usage: '[page number]',
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

    this.init();
  }

  public dialogs: IDialog[];

  public init () {
    this.dialogs = require('./guide-pages').default;
  }

  public async exec (message: Message, { page }: { page: number }) {
    try {
      const embeds = this.dialogs.map((v, i) => {
        if (!v)
          throw new Error(
            `Empty Dialog: Before ${this.dialogs[i].title || this.dialogs[i].category || this.dialogs[i].command}`
          );

        let title = v.title || null;
        let description: StringResolvable = v.description || '';

        if (v.category) {
          const category = this.handler.categories.get(v.category);

          if (!category) throw new Error('Invalid Category ' + v.category);

          title = `Category: ${v.category.toLowerCase()}`;
          description = [
            'Commands within this category:',
            category.map(c => {
              let content: string | string[] = c.description.content;
              content = Array.isArray(content) ? content[0] : content;

              return `**\`${c.id}\`** - ${content}`;
            }).join('\n'),
          ];
        } else if (v.command) {
          const command = this.handler.modules.get(v.command);

          if (!command) throw new Error('Invalid Command ' + v.command);

          const hasAliases = command.aliases && command.aliases.length;
          let content: string | string[] = command.description.content;
          content = Array.isArray(content) ? content.join('\n') : content;

          title = `Command: ${v.command.toLowerCase()}`;
          description = [
            `**Usage**: \`@Eros ${v.command} ${command.description.usage || ''}\``,
            `**Aliases**: ${hasAliases ? command.aliases.map(c => `\`${c}\``).join(', ') : 'None'}`,
            `**Brief Description**: ${content}`,
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
      const longest = this.dialogs.reduce((long, v) => {
        let title = v.title;

        if (v.category) title = ` + CATEGORY: ${v.category.toLowerCase()}`;
        if (v.command) title = `  | ${v.command.toLowerCase()}`;

        return Math.max(long, title.length);
      }, 0);
      const tableOfContents = this.util.embed()
        .setTitle('Table of Contents (Pages)')
        .setDescription([
          '```asciidoc',
          this.dialogs
            .map((v, i) => {
              let title = v.title;

              if (v.category) title = ` + CATEGORY: ${v.category.toLowerCase()}`;
              if (v.command) title = `  | ${v.command.toLowerCase()}`;

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
    } catch (err) { this.emitError(err, message, this); }
  }
}
