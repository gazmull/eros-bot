import { MessageEmbed } from 'discord.js';
import * as parseInfo from 'infobox-parser';
import fetch from 'node-fetch';
import ErosCommand from '../../struct/command';
import { Eidolon, Kamihime, Soul, Weapon } from '../../struct/Info';
import EidolonInfo from '../../struct/info/sub/EidolonInfo';
import KamihimeInfo from '../../struct/info/sub/KamihimeInfo';
import SoulInfo from '../../struct/info/sub/SoulInfo';
import WeaponInfo from '../../struct/info/sub/WeaponInfo';

export default class extends ErosCommand {
  constructor () {
    super('info', {
      aliases: [ 'info', 'i', 'khinfo', 'khi', 'kh' ],
      description: {
        content: 'Looks up for a Kamihime Project Character/Weapon at Kamihime Project Nutaku Fandom.',
        usage: '<item name> [flags]',
        examples: [
          'eros',
          'mars -r',
          'masamune -ts',
          'ea -tw',
          'hell staff -tw -r',
          'ea -tk -r',
        ]
      },
      cooldown: 5000,
      ratelimit: 2,
      lock: 'user',
      noTrash: true,
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
          flag: [ '-r', '--release', '--releases', '--releaseweapon' ]
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

  public async exec (
    message: IMessage,
    { item, preview, release, type }: { item: string, preview: boolean, release: boolean, type: string }
  ) {
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

      await message.util.send(`${this.client.config.emojis.loading} Awaiting KamihimeDB's response...`);

      const data = await this.acquire(item, false, type);

      if (!data) return message.util.edit(`No item named ${item} found.`);
      else if (data.info)
        return await this.triggerDialog(message, data.info.name, data.info);

      await this.awaitSelection(message, data.rows);
    } catch (err) { this.emitError(err, message, this, 1); }
  }

  public async acquire (item: string, accurate = false, type: string = null) {
    const typeQ = type || '';
    const { url } = this.client.config;
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
    const rawData = await this.client.util.getArticle(item);
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

    const { general: info }: { general: IKamihimeFandom } = parseInfo(sanitisedData(rawData));
    info.name = info.name.replace(/(?:\[)(.+)(?:\])/g, '($1)');

    return info;
  }

  public async parseKamihime (template: WeaponInfo, message: Message) {
    const db = await this.acquire(template.character.releases, true);
    const infoSub = await this.parseArticle(template.character.releases);

    return new Kamihime(
      this.client,
      this.handler.prefix(message) as string,
      db.info,
      infoSub
    );
  }

  public async parseWeapon (template: KamihimeInfo) {
    const db = await this.acquire(template.character.releaseWeapon, true);
    const infoSub = await this.parseArticle(template.character.releaseWeapon);

    return new Weapon(this.client, null, db.info, infoSub);
  }

  public async awaitSelection (message: Message, rows: IKamihimeDB[]) {
    const character = await this.client.util.selection.exec(message, rows);

    if (!character) return;

    const data = await fetch(
      `${this.client.config.url.api}id/${character.id}`,
      { headers: { Accept: 'application/json' } }
    );
    const _character = await data.json();

    if (_character.error) throw _character.error.message;

    await this.triggerDialog(message, character.name, _character);
  }

  public getCategory (id: string) {
    const discriminator = id.charAt(0);

    switch (discriminator) {
      default: return null;
      case 's': return 'soul';
      case 'e':
      case 'x': return 'eidolon';
      case 'k': return 'kamihime';
      case 'w': return 'weapon';
    }
  }

  public async triggerDialog (message: IMessage, item: string, dbRes: IKamihimeDB) {
    try {
      await message.util.edit(`${this.client.config.emojis.loading} Awaiting Fandom's response...`, { embed: null });
      const prefix = this.handler.prefix(message) as string;
      const category = this.getCategory(dbRes.id);
      const info = await this.parseArticle(item);
      let template: KamihimeInfo | EidolonInfo | SoulInfo | WeaponInfo;
      let template2: KamihimeInfo | WeaponInfo;
      let format2: MessageEmbed;

      switch (category) {
        case 'kamihime':
          template = new Kamihime(this.client, prefix, dbRes, info);
          break;
        case 'eidolon':
          template = new Eidolon(this.client, prefix, dbRes, info);
          break;
        case 'soul':
          template = new Soul(this.client, prefix, dbRes, info);
          break;
        case 'weapon':
          template = new Weapon(this.client, prefix, dbRes, info);
          break;
        default: return message.util.edit(':x: Invalid article.');
      }

      const releases = (template.character as IKamihimeFandomWeapon).releases;
      const releaseWeapon = (template.character as IKamihimeFandomKamihime).releaseWeapon;

      if (releases)
        template2 = await this.parseKamihime(template as WeaponInfo, message).catch(() => null);
      else if (releaseWeapon)
        template2 = await this.parseWeapon(template as KamihimeInfo).catch(() => null);

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

      if ((releaseWeapon || releases) && template && template2)
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
