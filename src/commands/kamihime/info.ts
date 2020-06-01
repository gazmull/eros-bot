import { Embeds } from 'discord-paginationembed';
import { Message, Message as MSG, MessageEmbed, TextChannel } from 'discord.js';
import * as parseInfo from 'infobox-parser';
// eslint-disable-next-line max-len
import { IKamihimeDB, IKamihimeFandom, IKamihimeFandomKamihime, IKamihimeFandomSoul, IKamihimeFandomWeapon } from '../../../typings';
import InfoCommand from '../../struct/command/InfoCommand';
import { EidolonInfo, KamihimeInfo, SoulInfo, WeaponInfo } from '../../struct/Info';

export default class extends InfoCommand {
  constructor () {
    super('info', {
      aliases: [ 'info', 'i', 'khinfo', 'khi', 'kh' ],
      description: {
        content: 'Looks up for a Kamihime PROJECT Character/Weapon at Kamihime PROJECT EN Fandom.',
        usage: '<item name> [flags]',
        examples: [
          'eros',
          'mars -r',
          'masamune -ts',
          'ea -tw',
          'hell staff -tw -r',
          'ea -tk -r',
          'arthur -ts -m',
          'holy sword ascalon -f',
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
          type: (_, name) => {
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
          id: 'accurate',
          match: 'flag',
          flag: [ '-a', '--accurate' ]
        },
        {
          id: 'mex',
          match: 'flag',
          flag: [ '-m', '--mex' ]
        },
        {
          id: 'flb',
          match: 'flag',
          flag: [ '-f', '--flb' ]
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

  public flbEmoji: string;

  public async exec (
    message: IMessage,
    { item, preview, release, accurate, mex, flb, type }: {
      item: string,
      preview: boolean,
      release: boolean,
      accurate: boolean,
      mex: boolean,
      flb: boolean,
      type: string
    }
  ) {
    try {
      if (!this.flbEmoji) this.flbEmoji = this.client.config.emojis['SSR+'].replace(/<a?:\w+:(\d+)>/, '$1');
      if (preview) message.needsPreview = true;
      if (release) message.needsRelease = true;
      if (mex) message.needsMex = true;
      if (flb) message.needsFLB = true;
      if (type !== null) {
        type = {
          s: 'soul',
          e: 'eidolon',
          k: 'kamihime',
          w: 'weapon'
        }[type.charAt(0)];

        if (type) type = `&class=${type}`;
      }

      const character: IKamihimeDB | Message = await super.exec(message, { item, approved: false, accurate, type });

      if (!character || character instanceof MSG) return;

      return this.triggerDialog(message, character);
    } catch (err) { this.handler.emitError(err, message, this, 1); }
  }

  public async triggerDialog (message: IMessage, result: IKamihimeDB) {
    try {
      await message.util.edit(`${this.client.config.emojis.loading} Awaiting Fandom's response...`, { embed: null });
      const prefix = await this.handler.prefix(message) as string;
      const category = this.getCategory(result.id);
      const info = await this.parseArticle(result.name) as IKamihimeFandom;
      let template: KamihimeInfo | EidolonInfo | SoulInfo | WeaponInfo;
      let template2: KamihimeInfo | WeaponInfo | SoulInfo;
      let format2: MessageEmbed;
      let hasWeapon = 0;
      let searchedWeapon = 0;

      switch (category) {
        case 'kamihime':
          template = new KamihimeInfo(this.client, prefix, result, info);
          break;
        case 'eidolon':
          template = new EidolonInfo(this.client, prefix, result, info);
          break;
        case 'soul':
          template = new SoulInfo(this.client, prefix, result, info);
          break;
        case 'weapon':
          template = new WeaponInfo(this.client, prefix, result, info);
          searchedWeapon = 1;
          break;
        default: return message.util.edit(':x: Invalid article.');
      }

      const releases = (template.character as IKamihimeFandomWeapon).releases;
      const releaseWeapon = (template.character as IKamihimeFandomKamihime).releaseWeapon;
      const mex = (template.character as IKamihimeFandomSoul).mex1Name;

      if (releases) {
        template2 = template as WeaponInfo;
        template = await this.parseKamihime(template as WeaponInfo, message).catch(() => undefined);
        searchedWeapon = 1;
        if (template2) hasWeapon = 1;
      } else if (releaseWeapon) {
        template2 = await this.parseWeapon(template as KamihimeInfo).catch(() => undefined);
        if (template2) hasWeapon = 1;
      } else if (mex)
        template2 = null;

      const hpFlb = hasWeapon
        ? (template2 as WeaponInfo).character.hpFlb
        : (template as WeaponInfo).character.hpFlb;
      const format = template.format();
      const assets = { [template.constructor.name]: template };
      const array = [ format ];

      if (typeof template2 !== 'undefined') {
        format2 = mex ? (template as SoulInfo).formatMex() : template2.format();

        array.push(format2);
        Object.assign(assets, { [mex ? template.constructor.name : template2.constructor.name]: template2 });
      }

      const embed: IEmbedsEx = this.client.embeds(null, array)
        .setChannel(message.channel as TextChannel)
        .setClientAssets({ message: message.util.lastResponse })
        .setAuthorizedUsers(message.author.id)
        .setDisabledNavigationEmojis([ 'back', 'jump', 'forward' ])
        .setTimeout(10e3);

      if (searchedWeapon && !(template instanceof WeaponInfo)) embed.setPage(2);

      if (
        (
          message.needsRelease ||
          (message.needsMex && template instanceof SoulInfo && mex)
        ) && typeof template2 !== 'undefined'
      )
        embed.setPage(searchedWeapon ? 1 : 2);

      if (message.needsFLB && hpFlb)
        embed.setPage(hasWeapon ? 3 : 2);

      if (message.needsPreview) {
        format.setImage(template.character.preview);

        if (format2)
          format2.setImage(template2.character.preview);
      }

      if (template.character.preview)
        embed.addFunctionEmoji('🖼', (_, instance: IEmbedsEx) => {
          instance.needsPreview = instance.needsPreview ? false : true;

          instance.currentEmbed.setImage(instance.needsPreview ? instance.preview : null);
        });

      const needsRelease = message.needsRelease && hasWeapon;
      const needsFLB = message.needsFLB && hasWeapon;
      const templateName = template.constructor.name;
      const template2Name = template2 ? template2.constructor.name : null;

      Object.assign(embed, {
        assets,
        needsPreview: message.needsPreview,
        preview: needsFLB || (needsRelease && !searchedWeapon)
          ? template2.character.preview
          : template.character.preview,
        currentClass: !message.needsMex
          ? (
            needsFLB || (needsRelease && !searchedWeapon)
              ? template2Name
              : templateName
          )
          : null,
        oldClass: template2 && !message.needsMex
          ? (
            needsFLB || (needsRelease && !searchedWeapon)
              ? templateName
              : template2Name
          )
          : null
      });

      if ((releaseWeapon || releases || mex) && template && typeof template2 !== 'undefined')
        embed.addFunctionEmoji('🔄', (_, instance: IEmbedsEx) => {
          if (instance.page === 3) return;

          const tmp = instance.currentClass;
          instance.currentClass = instance.oldClass;
          instance.oldClass = tmp;

          if (instance.currentClass)
            instance.preview = instance.assets[instance.currentClass].character.preview;

          instance.setPage(instance.page === 1 ? 2 : 1);

          if (instance.needsPreview)
            instance.currentEmbed.setImage(instance.preview);
          else
            instance.currentEmbed.setImage(null);
        });

      if (hpFlb) {
        const flbTemplate = hasWeapon ? template2 : template;
        const flbFormat = (flbTemplate as WeaponInfo).formatFLB();

        if (message.needsPreview)
          flbFormat.setImage(flbTemplate.character.preview);

        array.push(flbFormat);
        // ! - WIP Fix
        embed.addFunctionEmoji(
          this.flbEmoji,
          (_, instance: IEmbedsEx) => {
            if (!flbTemplate) return;

            instance.setPage(hasWeapon ? 3 : 2);
            instance.deleteFunctionEmoji(this.flbEmoji);
            instance.clientAssets.message.reactions.cache.delete(this.flbEmoji);

            if (instance.currentClass !== 'WeaponInfo') {
              const tmp = instance.currentClass;
              instance.currentClass = instance.oldClass;
              instance.oldClass = tmp;
            }

            if (instance.needsPreview)
              instance.currentEmbed.setImage(instance.preview);
            else
              instance.currentEmbed.setImage(null);
          }
        );
      }

      embed.build();

      return true;
    } catch (err) { this.handler.emitError(err, message, this, 2); }
  }

  public async parseArticle (item: string, infobox = true) {
    const rawData = await this.client.util.getArticle(item);
    const sanitisedData = (data: string) => {
      if (!data) throw new Error(`Wiki returned no item named ${item} found.`);
      const slicedData = !infobox || data.indexOf('==') === -1
        ? data
        : data.slice(data.indexOf('{{'), data.indexOf('=='));

      return slicedData
      // HTML Linebreaks
        .replace(/<br(?:| )(?:|\/)>/g, '\n')
      // Citations
        .replace(/<sup>(?:.+)<\/sup>/g, '')
      // Icons
        .replace(/(?:\{{2})(?:[^{}].*?)(?:\}{2})/g, '')
      // [[Abilities|Summon]] => Summon
        .replace(/(?:\[{2}[\w#]+\|)(.*?)(?:\]{2})/g, '$1')
      // [[Abilities|Summon]] => Abilities|Summon
        .replace(/(?:\[{2})(?:[\w\s]+\(\w+\)\|)?([^:]*?)(?:\]{2})/g, '$1')
      // [[Category]] => ''
        .replace(/(?:\[{2}).*?(?:\]{2})/g, '')
      // Double-spaces left by stripped of icons/links
        .replace(/ {2}/g, ' ')
      // Fix ugly Infobox format
        .replace(/\|([^|])/g, '\n| $1');
    };

    if (!infobox) return sanitisedData(rawData);

    const { general: info }: { general: IKamihimeFandom } = parseInfo(sanitisedData(rawData));
    info.name = info.name.replace(/(?:\[)(.+)(?:\])/g, '($1)');

    return info;
  }

  public async parseKamihime (template: WeaponInfo, message: Message) {
    const db = await this.acquire(template.character.releases, true, true);
    const infoSub = await this.parseArticle(template.character.releases) as IKamihimeFandom;

    return new KamihimeInfo(
      this.client,
      await this.handler.prefix(message) as string,
      db.info,
      infoSub
    );
  }

  public async parseWeapon (template: KamihimeInfo) {
    const db = await super.acquire(template.character.releaseWeapon, false, true);
    const infoSub = await this.parseArticle(template.character.releaseWeapon) as IKamihimeFandom;

    return new WeaponInfo(this.client, null, db.info, infoSub);
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
}

interface IMessage extends Message {
  needsPreview?: boolean;
  needsRelease?: boolean;
  needsMex?: boolean;
  needsFLB?: boolean;
}

interface IEmbedsEx extends Embeds {
  needsPreview?: boolean;
  preview?: string;
  currentClass?: string;
  oldClass?: string;
  assets?: {
    [name: string]: KamihimeInfo | EidolonInfo | SoulInfo | WeaponInfo;
  };
}
