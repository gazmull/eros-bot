import { Message, StringResolvable, Util, MessageEmbed, TextChannel } from 'discord.js';
import * as fs from 'fs-nextra';
import * as json2md from 'json2md';
import Command from '../../struct/command';
import toTitleCase from '../../util/toTitleCase';
import C from '../../util/Constants';

export default class GuideCommand extends Command {
  constructor () {
    super('guide', {
      aliases: [ 'guide' ],
      description: {
        content: 'Displays guide for using this bot and other game-related information.',
        usage: '[page number]',
        examples: [ '', '13', '37' ]
      },
      noTrash: true,
      args: [
        {
          id: 'page',
          type: 'integer',
          default: 1
        },
      ]
    });

    this.dialogs = require('./guide-pages').default;
  }

  public dialogs: IDialog[];

  public formattedGeneralDialogs: MessageEmbed[];

  public formattedCommandDialogs: { [id: string]: MessageEmbed };

  public init () {
    this.formattedCommandDialogs = this.formatCommandDialogs();
    this.formattedGeneralDialogs = this.formatGeneralDialogs();

    return this.client.logger.info('Guide Command: Initialised.');
  }

  public async exec (message: Message, { page }: { page: number }) {
    return this.client.embeds(message, this.formattedGeneralDialogs)
      .setAuthorizedUsers([ message.author.id ])
      .setChannel(message.channel as TextChannel)
      .setPage(page)
      .setTimeout(120e3)
      .build();
  }

  public formatGeneralDialogs () {
    const { docs } = this.client.config;
    const generalDialogs = this.dialogs.filter(d => !d.category && !d.command);
    const embeds = generalDialogs.map((v, i) => {
      if (!v)
        throw new Error(`Empty Dialog: Before ${ generalDialogs[i - 1].title}`);

      const embed = this.client.embed();

      embed
        .setTitle(v.title)
        .setDescription(v.description || '')
        .setImage(v.image);

      if (v.fields)
        for (const field of v.fields)
          embed.addField(field.name, field.value, field.inline || false);

      if (v.contributors)
        embed
          .addField(C.BLANK, C.BLANK)
          .addField('Contributors', v.contributors.join(', '));

      return embed;
    });
    const longest = generalDialogs.reduce((long, v) => Math.max(long, v.title.length), 0);
    const tableOfContents = this.client.embed()
      .setTitle('Table of Contents (Pages)')
      .setDescription([
        '```asciidoc',
        generalDialogs
          .map((v, i) => `${v.title}${' '.repeat(longest - v.title.length)} :: ${i + 2}`)
          .join('\n'),
        '```',
      ])
      .addField('Navigation Tip', [
        'React with the emoji below to navigate. ↗ to skip a page.',
        `You may also do \`@Eros guide <page number>\` to jump to a page immediately.`,
      ])
      .addField('Documentation', `Visiting the web documentation may be better to see what is new: ${docs}`);

    embeds.unshift(tableOfContents);

    return embeds;
  }

  public formatCommandDialogs () {
    const embeds: { [id: string]: MessageEmbed } = {};
    const commandDialogs = this.dialogs.filter(d => d.command);

    commandDialogs.map((d, i) => {
      if (!d)
        throw new Error(`Empty Dialog: Before ${commandDialogs[i - 1].command}`);

      let title = d.title || null;
      let description: StringResolvable = d.description || '';
      let example: string[] = null;
      const embed = this.client.embed();
      const command = this.handler.modules.get(d.command);

      if (!command) throw new Error(`Invalid Command ${d.command}`);

      const hasAliases = command.aliases && command.aliases.length;
      let content: string | string[] = command.description.content;
      content = Array.isArray(content) ? content.join('\n') : content;
      const id = /-/.test(d.command) ? d.command.split('-').join(' ') : d.command;
      const clientPermissions = command.clientPermissions as string[];
      const userPermissions = command.userPermissions as string[];

      title = `Command: ${id.toLowerCase()}`;
      description = [
        `**Usage**: \`@Eros ${id} ${command.description.usage || ''}\``,
        `**Aliases**: ${hasAliases ? command.aliases.map(c => `\`${c}\``).join(', ') : 'None'}`,
        `**Brief Description**: ${content}`,
        '',
        ...description,
      ];

      if (command.description.examples)
        example = command.description.examples.map(c => `@Eros ${id} ${c}`);

      embed
        .setTitle(title)
        .setDescription(description)
        .setImage(d.image);

      if (clientPermissions)
        embed.addField('Required Bot Permissions', clientPermissions.map(p => `\`${toTitleCase(p)}\``).join(', '));

      if (userPermissions)
        embed.addField('Required User Permissions', userPermissions.map(p => `\`${toTitleCase(p)}\``).join(', '));

      if (d.fields)
        for (const field of d.fields)
          embed.addField(field.name, field.value, field.inline || false);

      if (example)
        embed.addField('Examples', example);

      if (d.contributors)
        embed
          .addField(C.BLANK, C.BLANK)
          .addField('Contributors', d.contributors.join(', '));

      embeds[d.command] = embed;
    });

    return embeds;
  }

  public async renderDialogs () {
    try {
      const dialogs = this.dialogs.map((v, i) => {
        if (!v)
          throw new Error(
            `Empty Dialog: Before ${
              this.dialogs[i - 1].title ||
              this.dialogs[i - 1].category ||
              this.dialogs[i - 1].command
            }`
          );

        let filename: string = null;

        if (v.title) {
          const dirt = v.title.toLowerCase().replace(/ +/g, '-');

          filename = [ 'commands' ].includes(v.title)
            ? `${dirt}/README.md`
            : `${dirt}.md`;
        }
        else if (v.category)
          filename = `commands/${v.category}/README.md`;

        let title = v.title || null;
        let description: StringResolvable = v.description || '';
        let _clientPermissions: json2md.DataObject[] = null;
        let _userPermissions: json2md.DataObject[] = null;
        let example: json2md.DataObject[] = null;
        const page: json2md.DataObject[] = [];

        if (v.category) {
          const category = this.handler.categories.get(v.category);

          if (!category) throw new Error(`Invalid Category ${v.category}`);

          title = `Category: ${v.category.toLowerCase()}`;
          description = [
            'Commands within this category:',
            category.map(c => {
              let content: string | string[] = c.description.content;
              content = Array.isArray(content) ? content[0] : content;
              const id = /-/.test(c.id) ? c.id.split('-').join(' ') : c.id;

              return `[**\`${id}\`**](/commands/${v.category}/${c.id}.md) - ${content}`;
            }).join('\n'),
          ];
        } else if (v.command) {
          const command = this.handler.modules.get(v.command);

          if (!command) throw new Error(`Invalid Command ${v.command}`);

          const hasAliases = command.aliases && command.aliases.length;
          let content: string | string[] = command.description.content;
          content = Array.isArray(content) ? content.join('\n') : content;
          const id = /-/.test(v.command) ? v.command.split('-').join(' ') : v.command;
          const clientPermissions = command.clientPermissions as string[];
          const userPermissions = command.userPermissions as string[];

          filename = `commands/${command.categoryID}/${v.command}.md`;
          title = `Command: ${id.toLowerCase()}`;
          description = [
            `**Usage**: \`@Eros ${id} ${command.description.usage || ''}\``,
            `**Aliases**: ${hasAliases ? command.aliases.map(c => `\`${c}\``).join(', ') : 'None'}`,
            `**Brief Description**: ${content}`,
            '',
            ...description,
          ];

          if (clientPermissions)
            _clientPermissions = [
              { h2: 'Required Bot Permissions' },
              { code: { content: clientPermissions.map(p => toTitleCase(p)) } },
            ];
          if (userPermissions)
            _userPermissions = [
              { h2: 'Required User Permissions' },
              { code: { content: userPermissions.map(p => toTitleCase(p)) } },
            ];
          if (command.description.examples)
            example = [
              { h2: 'Examples' },
              { code: { content: command.description.examples.map(c => `@Eros ${id} ${c}`) } },
            ];
        }

        page.push(
          { h1: title },
          { p: Util.resolveString(description) }
        );

        if (_clientPermissions)
          page.push(_clientPermissions);

        if (_userPermissions)
          page.push(_userPermissions);

        if (v.fields)
          for (const field of v.fields)
            page.push(
              { h2: field.name },
              { p: Util.resolveString(field.value) }
            );

        if (example)
          page.push(...example);

        if (v.image)
          page.push({ img: [ { title: `${title} image`, source: v.image } ] });

        if (v.contributors)
          page.push(
            { p: '---' },
            { h5: 'Contributors' },
            { p: v.contributors.join(', ') }
          );

        return [ filename, page ];
      });

      dialogs.unshift([
        'SUMMARY.md',
        [ { h1: 'Table of Contents' },
          '- [CHANGELOG](CHANGELOG.md)',
          '- [Migrating From Kamihime Bot](MIGRATING.md)',
          ...this.dialogs.map(v => {
            let title = null;

            if (v.category)
              title = `  - CATEGORY: [${v.category}](commands/${v.category}/README.md)`;
            else if (v.command) {
              const command = this.handler.modules.get(v.command);

              title = `    - [${v.command}](commands/${command.categoryID}/${v.command}.md)`;
            }
            else
              title = `- [${v.title}](${v.title.replace(/ +/g, '-').toLowerCase()}.md)`;

            return title;
          }),
        ],
      ]);

      for (const dialog of dialogs)
        try {
          await fs.outputFile(`${__dirname}/../../../docs/${dialog[0]}`, json2md(dialog[1]));

          this.client.logger.info(`-- Successfully parsed ${dialog[0]}`);
        } catch (err) { throw new Error(`Failed to write ${dialog[0]}: ${err}`); }

      await Promise.all(
        [ 'CHANGELOG', 'MIGRATING', 'README' ].map(async f => {
          const src = `${__dirname}/../../../${f}.md`;
          const dest = `${__dirname}/../../../docs/${f}.md`;

          await fs.copy(src, dest);
          this.client.logger.info(`-- Successfully copied ${f}`);
        })
      );

      this.client.logger.info('Done parsing docs.');
      process.exit(0);
    } catch (err) {
      this.client.logger.error(err);
      process.exit(1);
    }
  }
}
