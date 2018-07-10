const Command = require('../../struct/custom/Command');
const { get } = require('snekfetch');
const parseInfo = require('infobox-parser');

const { loading, seeImage, hideImage } = require('../../auth').emojis;
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
        content: 'Looks up for a Kamihime Project Character/Weapon at KH-Nutaku Wikia.',
        usage: '<item name>',
        examples: ['eros', 'mars', 'mars -r'],
        flags: [
          {
            names: ['-p', '--preview'],
            value: 'Request item\'s image.'
          },
          {
            names: ['-r', '--release', '--relases', '--releaseweapon'],
            value: 'Request item\'s release weapon/character info instead.'
          }
        ]
      },
      cooldown: 5000,
      ratelimit: 2,
      shouldAwait: true,
      paginated: true,
      clientPermissions: ['MANAGE_MESSAGES', 'EMBED_LINKS', 'ADD_REACTIONS'],
      args: [
        {
          id: 'item',
          match: 'text',
          type: name => {
            if (!name || name.length < 2) return null;

            return name;
          },
          prompt: {
            start: 'which or whose information would you like to obtain?',
            retry: 'please provide an input with 2 characters and above.'
          }
        },
        {
          id: 'preview',
          match: 'flag',
          flag: ['-p', '--preview']
        },
        {
          id: 'release',
          match: 'flag',
          flag: ['-r', '--release', '--releases', '--releaseweapon']
        }
      ]
    });
  }

  async exec(message, { item, preview, release }) {
    try {
      if (preview) message.needsPreview = true;
      if (release) message.needsRelease = true;

      await message.util.send(`${loading} Awaiting KamihimeDB's response...`);

      const data = await this.acquire(item);

      if (!data) return message.util.edit(`No item named ${item} found.`);
      else if (data.info)
        return await this.triggerDialog(message, data.info.khName, data.info);

      await this.awaitSelection(message, data.rows);
    } catch (err) {
      return new this.client.APIError(message.util, err, 1);
    }
  }

  async acquire(item, accurate = false) {
    const request = await get(`${apiURL}search?name=${encodeURI(item)}`);
    const rows = request.body;

    if (!rows.length) return null;
    else if (rows.length === 1) {
      const row = rows.shift();
      const data = await get(`${apiURL}id/${row.khID}`);
      const info = data.body;

      return { info };
    } else if (accurate) {
      let character = null;

      for (const row of rows)
        if (row.khName === item) {
          character = row;

          break;
        }

      if (!character) throw new Error('Item is unavailable.');

      const data = await get(`${apiURL}id/${character.khID}`);
      const info = data.body;

      return { info };
    }

    return { rows };
  }

  async parseArticle(item) {
    const rawData = await this.client.getArticle(item);
    const sanitisedData = data => {
      if (!data) throw `API returned no item named ${item} found.`;
      const slicedData = data.indexOf('==') === -1
        ? data
        : data.slice(data.indexOf('{{'), data.indexOf('=='));

      return slicedData
        .replace(/<br(?:| )(?:|\/)>/g, '\n')
        .replace(/<sup>(?:.+)<\/sup>/g, '')
        .replace(/(?:\{{2})(?:[^{}].*?)(?:\}{2})/g, '')
        .replace(/(?:\[{2}[\w#]+\|)(.*?)(?:\]{2})/g, '$1')
        .replace(/(?:\[{2})([^:]*?)(?:\]{2})/g, '$1')
        .replace(/(?:\[{2}).*?(?:\]{2})/g, '');
    };

    const info = parseInfo(sanitisedData(rawData));
    info.name = info.name.replace(/(?:\[)(.+)(?:\])/g, '($1)');

    return info;
  }

  async parseKamihime(template, prefix) {
    const db = await this.acquire(template.character.releases, true);
    const infoSub = await this.parseArticle(template.character.releases);

    return new Kamihime(this.client, prefix, db.info, infoSub);
  }

  async parseWeapon(template) {
    const db = await this.acquire(template.character.releaseWeapon, true);
    const infoSub = await this.parseArticle(template.character.releaseWeapon);

    return new Weapon(this.client, null, db.info, infoSub);
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
      const info = await this.parseArticle(item);
      let template;

      switch (true) {
        case category.includes('Category:Kamihime'):
          template = new Kamihime(this.client, prefix, dbRes, info);
          break;
        case category.includes('Category:Eidolons'):
          template = new Eidolon(this.client, prefix, dbRes, info);
          break;
        case category.includes('Category:Souls'):
          template = new Soul(this.client, prefix, dbRes, info);
          break;
        case category.includes('Category:Weapons'):
          template = new Weapon(this.client, prefix, dbRes, info);
          break;
        default: return message.reply('invalid article.');
      }

      if (message.needsRelease && (template instanceof Kamihime || template instanceof Weapon))
        switch (true) {
          case template instanceof Kamihime: {
            const tmp = await this.parseWeapon(template);
            template = tmp;
            break;
          }
          case template instanceof Weapon: {
            const tmp = await this.parseKamihime(template, prefix);
            template = tmp;
            break;
          }
        }

      let embed = await template.format();

      if (message.needsPreview)
        embed.setImage(template.character.preview);

      embed = this.paginationEmbeds()
        .setArray([embed])
        .setChannel(message.channel)
        .setClientMessage(message.util.lastResponse, '\u200B')
        .setAuthorizedUsers([message.author.id])
        .showPageIndicator(false)
        .setDisabledNavigationEmojis(['BACK', 'JUMP', 'FORWARD'])
        .setTimeout(1000 * 60 * 1)
        .setFunctionEmojis({
          [seeImage]: (_, instance) => {
            const e = instance.array[0];

            e.setImage(instance.preview ? instance.preview : template.character.preview);

            message.needsPreview = true;
          },
          [hideImage]: (_, instance) => {
            const e = instance.array[0];

            e.setImage(null);

            message.needsPreview = false;
          }
        });

      if (template.character.releaseWeapon)
        embed.addFunctionEmoji('⚔', async (_, instance) => {
          const msg = instance.clientMessage.message;

          await msg.edit(`${loading} Acquiring Weapon...`);

          const tmp = await this.parseWeapon(template);

          instance.preview = await tmp.itemPreview();
          instance.array[0] = await tmp.format();

          if (message.needsPreview) instance.array[0].setImage(instance.preview);

          msg.reactions.get('⚔').users.remove(msg.client.user.id);
          delete instance.functionEmojis['⚔'];

          await msg.edit('\u200B');
        });

      if (template.character.releases)
        embed.addFunctionEmoji('🙋', async (_, instance) => {
          const msg = instance.clientMessage.message;

          await msg.edit(`${loading} Acquiring Kamihime...`);

          const tmp = await this.parseKamihime(template, prefix);

          instance.preview = await tmp.itemPreview();
          instance.array[0] = await tmp.format();

          if (message.needsPreview) instance.array[0].setImage(instance.preview);

          msg.reactions.get('🙋').users.remove(msg.client.user.id);
          delete instance.functionEmojis['🙋'];

          await msg.edit('\u200B');
        });

      return embed.build();
    } catch (err) {
      return new this.client.APIError(message.util, err, 2);
    }
  }
}

module.exports = InfoCommand;
