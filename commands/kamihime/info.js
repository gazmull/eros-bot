const Command = require('../../struct/custom/Command');
const { get } = require('snekfetch');
const parseInfo = require('infobox-parser');

const { loading } = require('../../auth').emojis;
const { api: apiURL } = require('../../auth').url;

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
      shouldAwait: true,
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
  }

  async exec(message, { item }) {
    try {
      await message.util.send(`${loading} Awaiting KamihimeDB's response...`);

      const request = await get(`${apiURL}search?name=${encodeURI(item)}`);
      const rows = request.body;

      if (!rows.length) return message.util.edit(`No item named ${item} found.`);
      else if (rows.length === 1) {
        const result = rows.shift();
        const data = await get(`${apiURL}id/${result.khID}`);

        return await this.triggerDialog(message, result.khName, data.body);
      }

      await this.awaitSelection(message, rows);
    } catch (err) {
      return new this.client.APIError(message.util, err, 1);
    }
  }

  async awaitSelection(message, rows) {
    const character = await this.client.util.selection.execute(message, rows);

    if (!character) return;

    const data = await get(`${apiURL}id/${character.khID}`);

    await this.triggerDialog(message, character.khName, data.body);
  }

  async triggerDialog(message, item, dbRes) {
    try {
      await message.util.edit(`${loading} Awaiting Wikia's response...`, { embed: null });
      const prefix = this.handler.prefix(message);
      const category = await this.client.getArticleCategories(item);
      const rawData = await this.client.getArticle(item);
      const sanitisedData = data => {
        if (!data) throw `API returned no item named ${item} found.`;
        const slicedData = data.indexOf('==') === -1
          ? data
          : data.slice(data.indexOf('{{'), data.indexOf('=='));

        return slicedData
          .replace(/<br(?:| )(?:|\/)>/g, '\n')
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
      return new this.client.APIError(message.util, err, 2);
    }
  }
}

module.exports = InfoCommand;
