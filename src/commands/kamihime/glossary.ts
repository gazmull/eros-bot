import { Message } from 'discord.js';
import Command from '../../struct/command';
import InfoCommand from './info.js';

export default class extends Command {
  constructor () {
    super('glossary', {
      aliases: [ 'glossary', 'g', 'dictionary', 'dict', 'term' ],
      description: {
        content: [
          'Displays definition(s) from Kamihime EN Fandom\'s Glossary page.',
          '',
          'To display specific results:',
          '- **Single Character**: Returns a list of definitions starting with that character.',
          '- **Word**: Returns a definition.',
        ],
        usage: '<single character / word>',
        examples: [ 'a', '1', 'mvp' ]
      },
      args: [
        {
          id: 'keyword',
          match: 'text',
          type: 'lowercase',
          prompt: {
            start: 'what definition(s) from glossary would you like to see?'
          }
        },
      ]
    });
  }

  public glossary: { [character: string]: string[] } = {};

  public timer: NodeJS.Timeout;

  public async exec (message: Message, { keyword }: { keyword: string }) {
    const section = this.glossary[keyword.charAt(0)];

    if (!section) return message.util.reply(`There's no section for input **${keyword}**.`);

    const data = keyword.length === 1
      ? section.map(el => el.replace(/(.*) -/g, '- **$1**: '))
      : section.find(l => l.toLowerCase().startsWith(keyword));

    if (!data) return message.util.reply(`Nothing found with input **${keyword}**`);

    return message.util.send(Array.isArray(data) ? data : data.replace(/.* - /, '') );
  }

  public async initGlossary () {
    try {
      if (this.timer) this.client.clearTimeout(this.timer);

      const infoCommand = this.handler.modules.get('info') as InfoCommand;
      const data = await infoCommand.parseArticle('Glossary', false) as string;
      const sectionRegex = /==\s?(\w+)\s?==([^=]*)/g;
      const capturedSections: RegExpExecArray[] = [];
      let temp: RegExpExecArray;

      // tslint:disable-next-line: no-conditional-assignment
      while ((temp = sectionRegex.exec(data)) != null) capturedSections.push(temp);

      for (const section of capturedSections)
        Object.assign(this.glossary, {
          [section[1].toLowerCase()]: section[2]
            .replace(/\* +/g, '')
            .replace(/'{3}(.+)'{3}/g, '$1')
            .split('\n')
            .filter(s => s)
        });

      this.timer = this.client.setTimeout(this.initGlossary.bind(this), 36e5 * 12);

      return this.client.logger.info('Glossary Command: Initialised Glossary');
    } catch (err) { return this.client.logger.error(`Glossary Command: Error on initialising Glossary: ${err.stack}`); }
  }
}
