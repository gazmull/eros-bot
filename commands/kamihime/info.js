const { error } = require('../../utils/console');

const { Command } = require('discord-akairo');
const { get } = require('snekfetch');
const parseInfo = require('infobox-parser');

const { loading } = require('../../auth').emojis;
const { api } = require('../../auth').url;

const {
  Kamihime,
  Eidolon,
  Soul,
  Weapon
} = require('../../struct/Info');

class InfoCommand extends Command {
  constructor() {
    super('info', {
      aliases: ['info', 'i', 'khinfo', 'khi', 'kh'],
      description: {
        content: 'Looks up for a Kamihime Project Character/Weapon/Accessory at KH-Nutaku Wikia.',
        usage: '<item name>',
        examples: ['eros', 'mars']
      },
      clientPermissions: ['MANAGE_MESSAGES', 'EMBED_LINKS'],
      args: [
        {
          id: 'item',
          match: 'text',
          type: word => {
            if (!word || word.length < 2) return null;

            return word;
          },
          prompt: {
            start: 'which or whose information would you like to obtain?',
            retry: 'please provide an input with 2 characters and above.'
          }
        }
      ]
    });
    this.shouldAwait = true;
  }

  async exec(message, { item }) {
    try {
      await message.util.send(`${loading} Awaiting KamihimeDB's response...`);

      const prefix = this.handler.prefix(message);
      const request = await get(`${api}search?name=${encodeURI(item)}`);
      const rows = request.body;

      if (!rows.length) return message.util.edit(`No item named ${item} found.`);
      else if (rows.length === 1) {
        const result = rows.shift();
        const data = await get(`${api}id/${result.khID}`);

        return await this.triggerDialog(message, result.khName, data.body, prefix);
      }

      await this.awaitSelection(message, rows, prefix);
    } catch (err) {
      if (err.stack)
        error(err.stack);

      return message.util.edit(`I cannot complete the query because:\n\`\`\`x1\n${err.message}\`\`\`Step: KamihimeDB Request`);
    }
  }

  async awaitSelection(message, result, prefix) {
    const embed = this.client.util.embed()
      .setColor(0xFF00AE)
      .setTitle('Menu Selection')
      .setFooter('Expires within 30 seconds.')
      .setDescription(
        [
          'Multiple items match with your query.',
          'Select an item by their designated `number` to continue.',
          'Saying `cancel` or `0` will cancel the command.'
        ]
      )
      .addField('#', result.map(i => result.indexOf(i) + 1).join('\n'), true)
      .addField('Name', result.map(i => i.khName).join('\n'), true);

    await message.util.edit({ embed });
    this.client.awaitingUsers.set(message.author.id, true);

    try {
      const responses = await message.channel.awaitMessages(
        m =>
          m.author.id === message.author.id &&
            (m.content.toLowerCase() === 'cancel' || parseInt(m.content) === 0 ||
            (parseInt(m.content) >= 1 && parseInt(m.content) <= result.length)), {
          max: 1,
          time: 30 * 1000,
          errors: ['time']
        }
      );

      const response = responses.first();
      if (response.content.toLowerCase() === 'cancel' || parseInt(response.content) === 0) {
        this.client.awaitingUsers.delete(message.author.id);

        return message.util.edit('Selection cancelled.', { embed: null });
      }
      const responseIdx = parseInt(response.content) - 1;
      const data = await get(`${api}id/${result[responseIdx].khID}`);
      await this.triggerDialog(message, result[responseIdx].khName, data.body, prefix);
      if (message.guild) response.delete();
    } catch (err) {
      if (err.stack) {
        error(err);

        message.util.edit(
          `I cannot complete the query because:\n\`\`\`x1\n${err}\`\`\`Step: Menu Selection`,
          { embed: null }
        );
      }

      message.util.edit('Selection expired.', { embed: null });
    }
    this.client.awaitingUsers.delete(message.author.id);
  }

  async triggerDialog(message, item, dbRes, prefix) {
    try {
      await message.util.edit(`${loading} Awaiting Wikia's response...`, { embed: null });
      const category = await this.client.getArticleCategories(item);
      const rawData = await this.client.getArticle(item);
      const sanitisedData = data => {
        if (!data) throw `API returned no item named ${item} found.`;
        const slicedData = data.indexOf('==') === -1
          ? data
          : data.slice(data.indexOf('{{'), data.indexOf('=='));

        return slicedData
          .replace(/<br(?:| )(?:|\/)>/g, '\n\n')
          .replace(/(?:\{{2})(?:[^{}].*?)(?:\}{2})/g, '')
          .replace(/(?:\[{2}[\w#]+\|)(.*?)(?:\]{2})/g, '$1')
          .replace(/(?:\[{2})([^:]*?)(?:\]{2})/g, '$1')
          .replace(/(?:\[{2}).*?(?:\]{2})/g, '');
      };

      let embed;
      let template;
      const result = parseInfo(sanitisedData(rawData));
      result.name = result.name.replace(/(?:\[)(.+)(?:\])/g, '($1)');

      switch (true) {
        case category.includes('Category:Kamihime'):
          template = new Kamihime(this.client, prefix, dbRes, result);
          embed = await template.format();
          break;
        case category.includes('Category:Eidolons'):
          template = new Eidolon(this.client, prefix, dbRes, result);
          embed = await template.format();
          break;
        case category.includes('Category:Souls'):
          template = new Soul(this.client, prefix, dbRes, result);
          embed = await template.format();
          break;
        case category.includes('Category:Weapons'):
          template = new Weapon(this.client, prefix, dbRes, result);
          embed = await template.format();
          break;
        default: return message.reply('invalid article.');
      }

      return message.util.edit({ embed });
    } catch (err) {
      if (err.stack)
        error(err.stack);

      return message.util.edit(
        `I cannot complete the query because:\n\`\`\`x1\n${err}\`\`\`Step: Wikia Request`,
        { embed: null }
      );
    }
  }
}

module.exports = InfoCommand;
