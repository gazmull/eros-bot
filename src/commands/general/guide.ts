import { StringResolvable, Util } from 'discord.js';
import * as fs from 'fs-extra';
import * as json2md from 'json2md';
import ErosCommand from '../../struct/command';
import toTitleCase from '../../util/toTitleCase';

export default class extends ErosCommand {
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

    this.init();
  }

  public dialogs: IDialog[];

  public init () {
    this.dialogs = require('./guide-pages').default;
  }

  public async exec (message: Message, { page }: { page: number }) {
    try {
      const { docs, emojis } = this.client.config;
      const embeds = this.dialogs.map((v, i) => {
        if (!v)
          throw new Error(
            `Empty Dialog: Before ${
              this.dialogs[i - 1].title ||
              this.dialogs[i - 1].category ||
              this.dialogs[i - 1].command
            }`
          );

        let title = v.title || null;
        let description: StringResolvable = v.description || '';
        let example: string[] = null;
        const embed = this.util.embed();

        if (v.category) {
          const category = this.handler.categories.get(v.category);

          if (!category) throw new Error('Invalid Category ' + v.category);

          title = `Category: ${v.category.toLowerCase()}`;
          description = [
            'Commands within this category:',
            category.map(c => {
              let content: string | string[] = c.description.content;
              content = Array.isArray(content) ? content[0] : content;
              const id = /-/.test(c.id) ? c.id.split('-').join(' ') : c.id;

              return `**\`${id}\`** - ${content}`;
            }).join('\n'),
          ];
        } else if (v.command) {
          const command = this.handler.modules.get(v.command);

          if (!command) throw new Error('Invalid Command ' + v.command);

          const hasAliases = command.aliases && command.aliases.length;
          let content: string | string[] = command.description.content;
          content = Array.isArray(content) ? content.join('\n') : content;
          const id = /-/.test(v.command) ? v.command.split('-').join(' ') : v.command;

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
        }

        embed
          .setTitle(title)
          .setDescription(description)
          .setImage(v.image);

        if (v.fields)
          for (const field of v.fields)
            embed.addField(field.name, field.value, field.inline || false);

        if (example)
          embed.addField('Examples', example);

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
            this.handler.prefix(message)}guide <page number>\` to jump to a page immediately.`,
        ])
        .addField('Documentation', 'Visiting the web documentation may be better to see what is new: ' + docs);

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

  public async parseDialogs () {
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
            ? dirt + '/README.md'
            : dirt + '.md';
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

          if (!category) throw new Error('Invalid Category ' + v.category);

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

          if (!command) throw new Error('Invalid Command ' + v.command);

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
          await fs.outputFile(`${__dirname}/../../../../eros-docs/${dialog[0]}`, json2md(dialog[1]));

          this.client.logger.status(`-- Successfully parsed ${dialog[0]}`);
        } catch (err) { throw new Error(`Failed to write ${dialog[0]}: ${err}`); }

      let readme = (await fs.readFile(`${__dirname}/../../../README.md`)).toString();
      readme = readme.slice(readme.indexOf('# Eros'));
      readme = [
        '![Click the image to proceed to the invite URL](.gitbook/assets/ersu.webp)',
        '',
        '[![Build Status](https://travis-ci.org/gazmull/eros-bot.svg?branch=master)]' +
        '(https://travis-ci.org/gazmull/eros-bot)',
      ]
      .join('\n')
      .concat('\n' + readme);

      await fs.outputFile(`${__dirname}/../../../../eros-docs/README.md`, readme);
      this.client.logger.status('-- Successfully copied README');

      const changelog = (await fs.readFile(`${__dirname}/../../../CHANGELOG.md`)).toString();

      await fs.outputFile(`${__dirname}/../../../../eros-docs/CHANGELOG.md`, changelog);
      this.client.logger.status('-- Successfully copied CHANGELOG');

      this.client.logger.status('Done parsing docs.');
      process.exit(0);
    } catch (err) {
      this.client.logger.error(err);
      process.exit(1);
    }
  }
}
