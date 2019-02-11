import { PrefixSupplier } from 'discord-akairo';
import * as parseInfo from 'infobox-parser';
import fetch from 'node-fetch';
// @ts-ignore
import { emojis, url } from '../../../auth';
import Command from '../../struct/command/Command';
import ErosClient from '../../struct/ErosClient';
import { Eidolon, Kamihime, Soul, Weapon } from '../../struct/Info';

const flag = [ '-r', '--release', '--releases', '--releaseweapon' ];

// ! - Rework the flag prefixes; unite them
export default class extends Command {
  constructor () {
    super('info', {
      aliases: [ 'info', 'i', 'khinfo', 'khi', 'kh' ],
      description: {
        content: 'Looks up for a Kamihime Project Character/Weapon at KH-Nutaku Wikia.',
        usage: '<item name> <flags>',
        examples: [ 'eros', 'mars', 'mars -r' ],
        flags: [
          {
            names: [ '-ts', '--type=soul', '-te', '--type=eidolon', '-tk', '--type=kamihime', '-tw', '--type=weapon' ],
            value: 'Narrow down search results respectively by: *Soul* / *Eidolon* / *Kamihime* / *Weapon*'
          },
          {
            names: [ '-p', '--preview' ],
            value: 'Request item\'s image.'
          },
          {
            names: flag,
            value: 'Request item\'s release weapon/character info instead.'
          },
        ]
      },
      cooldown: 5000,
      ratelimit: 2,
      lock: 'user',
      paginated: true,
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
            retry: 'please provide an input with at least 2 characters.'
          }
        },
        {
          id: 'preview',
          match: 'flag',
          flag: [ '-p', '--preview' ]
        },
        {
          id: 'release',
          match: 'flag',
          flag
        },
        {
          id: 'type',
          match: 'option',
          flag: [ '-t', '--type=' ],
          default: null
        },
      ]
    });
  }

  public async exec (message: IMessage, { item, preview, release, type }) {
    try {
      if (preview) message.needsPreview = true;
      if (release) message.needsRelease = true;
      if (type !== null) {
        type = {
          s: 'soul',
          e: 'eidolon',
          k: 'kamihime',
          w: 'weapon'
        }[type.charAt(0)];

        if (type) type = `&class=${type}`;
      }

      await message.util.send(`${emojis.loading} Awaiting KamihimeDB's response...`);

      const data = await this.acquire(item, false, type);

      if (!data) return message.util.edit(`No item named ${item} found.`);
      else if (data.info)
        return await this.triggerDialog(message, data.info.name, data.info);

      await this.awaitSelection(message, data.rows);
    } catch (err) { this.emitError(err, message, this, 1); }
  }

  public async acquire (item: string, accurate = false, type = null) {
    const typeQ = type || '';
    const request = await fetch(`${url.api}search?name=${encodeURI(item)}${typeQ}`, {
      headers: { Accept: 'application/json' }
    });
    const rows = await request.json();

    if (rows.error) throw rows.error.message;

    if (!rows.length) return null;
    else if (rows.length === 1) {
      const row = rows.shift();
      const data = await fetch(`${url.api}id/${row.id}`, { headers: { Accept: 'application/json' } });
      const info = await data.json();

      if (info.error) throw info.error.message;

      return { info };
    } else if (accurate) {
      let character = null;

      for (const row of rows)
        if (row.name === item) {
          character = row;

          break;
        }

      if (!character) throw new Error('Item is unavailable.');

      const data = await fetch(`${url.api}id/${character.id}`, { headers: { Accept: 'application/json' } });
      const info = await data.json();

      if (info.error) throw info.error.message;

      return { info };
    }

    return { rows };
  }

  public async parseArticle (item: string) {
    const client = this.client as ErosClient;
    const rawData = await client.util.getArticle(item);
    const sanitisedData = (data: string) => {
      if (!data) throw new Error(`API returned no item named ${item} found.`);
      const slicedData = data.indexOf('==') === -1
        ? data
        : data.slice(data.indexOf('{{'), data.indexOf('=='));

      return slicedData
        .replace(/<br(?:| )(?:|\/)>/g, '\n') // HTML Linebreaks
        .replace(/<sup>(?:.+)<\/sup>/g, '') // Citations
        .replace(/(?:\{{2})(?:[^{}].*?)(?:\}{2})/g, '') // Icons
        .replace(/(?:\[{2}[\w#]+\|)(.*?)(?:\]{2})/g, '$1') // [[Abilities|Summon]] => Summon
        .replace(/(?:\[{2})(?:[\w\s]+\(\w+\)\|)?([^:]*?)(?:\]{2})/g, '$1') // [[Abilities|Summon]] => Abilities|Summon
        .replace(/(?:\[{2}).*?(?:\]{2})/g, '') // [[Category]] => ''
        .replace(/ {2}/g, ' ') // Double-spaces left by stripped of icons/links
        .replace(/\|([^|])/g, '\n| $1'); // Fix ugly Infobox format
    };

    const { general: info } = parseInfo(sanitisedData(rawData));
    info.name = info.name.replace(/(?:\[)(.+)(?:\])/g, '($1)');

    return info;
  }

  public async parseKamihime (template, message: Message) {
    const db = await this.acquire(template.character.releases, true);
    const infoSub = await this.parseArticle(template.character.releases);

    return new Kamihime(
      this.client as ErosClient,
      (this.handler.prefix as PrefixSupplier)(message) as string,
      db.info,
      infoSub
    );
  }

  public async parseWeapon (template) {
    const db = await this.acquire(template.character.releaseWeapon, true);
    const infoSub = await this.parseArticle(template.character.releaseWeapon);

    return new Weapon(this.client as ErosClient, null, db.info, infoSub);
  }

  public async awaitSelection (message: Message, rows: IKamihimeDB[]) {
    const client = this.client as ErosClient;
    const character = await client.util.selection.exec(message, rows);

    if (!character) return;

    const data = await fetch(`${url.api}id/${character.id}`, { headers: { Accept: 'application/json' } });
    const _character = await data.json();

    if (_character.error) throw _character.error.message;

    await this.triggerDialog(message, character.name, _character);
  }

  public async triggerDialog (message: IMessage, item: string, dbRes: IKamihimeDB) {
    const client = this.client as ErosClient;

    try {
      await message.util.edit(`${emojis.loading} Awaiting Wikia's response...`, { embed: null });
      const prefix = (this.handler.prefix as PrefixSupplier)(message) as string;
      const category = await client.util.getArticleCategories(item);
      const info = await this.parseArticle(item);
      let template;
      let template2;
      let format2;

      switch (category.title) {
        case 'Category:Kamihime':
          template = new Kamihime(client, prefix, dbRes, info);
          break;
        case 'Category:Eidolons':
          template = new Eidolon(client, prefix, dbRes, info);
          break;
        case 'Category:Souls':
          template = new Soul(client, prefix, dbRes, info);
          break;
        case 'Category:Weapons':
          template = new Weapon(client, prefix, dbRes, info);
          break;
        default: return message.reply('invalid article.');
      }

      if (template.character.releases)
        template2 = await this.parseKamihime(template, message).catch(() => null);
      else if (template.character.releaseWeapon)
        template2 = await this.parseWeapon(template).catch(() => null);

      if (
        message.needsRelease &&
          (
            (template instanceof Kamihime && template.character.releaseWeapon) ||
            (template instanceof Weapon && template.character.releases)
          ) && template2
      ) {
        const tmp = template2;
        template2 = template;
        template = tmp;
      }

      const format = await template.format();
      const assets = { [template.constructor.name]: template };
      const array = [ format ];

      if (template2) {
        format2 = await template2.format();

        array.push(format2);
        Object.assign(assets, { [template2.constructor.name]: template2 });
      }

      if (message.needsPreview)
        format.setImage(template.character.preview);

      const embed = this.util.embeds()
        .setArray(array)
        .setChannel(message.channel)
        .setClientMessage(message.util.lastResponse, '\u200B')
        .setAuthorizedUsers([ message.author.id ])
        .showPageIndicator(false)
        .setDisabledNavigationEmojis([ 'BACK', 'JUMP', 'FORWARD' ])
        .setTimeout(1000 * 60 * 1)
        .setFunctionEmojis({
          '🖼': (_, instance) => {
            instance.needsPreview = instance.needsPreview ? false : true; // eslint-disable-line no-unneeded-ternary

            instance.currentEmbed.setImage(instance.needsPreview ? instance.preview : null);
          }
        });

      Object.assign(embed, {
        assets,
        needsPreview: message.needsPreview,
        preview: template.character.preview,
        currentClass: template.constructor.name,
        oldClass: template2 ? template2.constructor.name : null
      });

      if ((template.character.releaseWeapon || template.character.releases) && template && template2)
        embed.addFunctionEmoji('🔄', (_, instance) => {
          const tmp = instance.currentClass;
          instance.currentClass = instance.oldClass;
          instance.oldClass = tmp;
          instance.preview = instance.assets[instance.currentClass].character.preview;

          instance.setPage(instance.page === 1 ? 2 : 1);

          if (instance.needsPreview)
            instance.currentEmbed.setImage(instance.preview);
        });

      return embed.build();
    } catch (err) { this.emitError(err, message, this, 2); }
  }
}

interface IMessage extends Message {
  needsPreview?: boolean;
  needsRelease?: boolean;
}
