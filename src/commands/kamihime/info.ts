import Embeds from 'discord-paginationembed/typings/Embeds';
import { Message, Message as MSG, MessageEmbed, TextChannel } from 'discord.js';
import * as parseInfo from 'infobox-parser';
// tslint:disable-next-line:max-line-length
import { IKamihimeDB, IKamihimeFandom, IKamihimeFandomKamihime, IKamihimeFandomSoul, IKamihimeFandomWeapon } from '../../../typings';
import ErosInfoCommand from '../../struct/command/ErosInfoCommand';
import { Eidolon, Kamihime, Soul, Weapon } from '../../struct/Info';
import EidolonInfo from '../../struct/info/sub/EidolonInfo';
import KamihimeInfo from '../../struct/info/sub/KamihimeInfo';
import SoulInfo from '../../struct/info/sub/SoulInfo';
import WeaponInfo from '../../struct/info/sub/WeaponInfo';

export default class extends ErosInfoCommand {
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
          'arthur -ts -m',
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
    { item, preview, release, accurate, mex, type }: {
      item: string,
      preview: boolean,
      release: boolean,
      accurate: boolean,
      mex: boolean,
      type: string
    }
  ) {
    try {
      if (preview) message.needsPreview = true;
      if (release) message.needsRelease = true;
      if (mex) message.needsMex = true;
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
    } catch (err) { this.emitError(err, message, this, 1); }
  }

  public async triggerDialog (message: IMessage, result: IKamihimeDB) {
    try {
      await message.util.edit(`${this.client.config.emojis.loading} Awaiting Fandom's response...`, { embed: null });
      const prefix = await this.handler.prefix(message) as string;
      const category = this.getCategory(result.id);
      const info = await this.parseArticle(result.name);
      let template: KamihimeInfo | EidolonInfo | SoulInfo | WeaponInfo | true;
      let template2: KamihimeInfo | WeaponInfo | SoulInfo | true;
      let format2: MessageEmbed;

      switch (category) {
        case 'kamihime':
          template = new Kamihime(this.client, prefix, result, info);
          break;
        case 'eidolon':
          template = new Eidolon(this.client, prefix, result, info);
          break;
        case 'soul':
          template = new Soul(this.client, prefix, result, info);
          break;
        case 'weapon':
          template = new Weapon(this.client, prefix, result, info);
          break;
        default: return message.util.edit(':x: Invalid article.');
      }

      const releases = (template.character as IKamihimeFandomWeapon).releases;
      const releaseWeapon = (template.character as IKamihimeFandomKamihime).releaseWeapon;
      const mex = (template.character as IKamihimeFandomSoul).mex1Name;

      if (releases)
        template2 = await this.parseKamihime(template as WeaponInfo, message).catch(() => null);
      else if (releaseWeapon)
        template2 = await this.parseWeapon(template as KamihimeInfo).catch(() => null);
      else if (mex)
        template2 = true;

      if (
        (
          (
            message.needsRelease &&
            (
              (template instanceof Kamihime && releaseWeapon) ||
              (template instanceof Weapon && releases)
            )
          ) ||
          (message.needsMex && template instanceof Soul && mex)
        ) && template2
      ) {
        const tmp = template2;
        template2 = template;
        template = tmp as KamihimeInfo | WeaponInfo | SoulInfo;
      }

      const format = typeof template === 'boolean' ? (template2 as SoulInfo).formatMex() : template.format();
      const assets = { [template.constructor.name]: template };
      const array = [ format ];

      if (template2) {
        format2 = typeof template2 === 'boolean' ? (template as SoulInfo).formatMex() : template2.format();

        array.push(format2);
        Object.assign(assets, { [template2.constructor.name]: template2 });
      }

      if (message.needsPreview)
        format.setImage(template.character.preview);

      const embed: IEmbedsEx = this.util.embeds()
        .setArray(array)
        .setChannel(message.channel as TextChannel)
        .setClientAssets({ message: message.util.lastResponse, prepare: '\u200B' })
        .setAuthorizedUsers([ message.author.id ])
        .showPageIndicator(false)
        .setDisabledNavigationEmojis([ 'BACK', 'JUMP', 'FORWARD' ])
        .setTimeout(1000 * 60 * 1)
        .setFunctionEmojis({
          '🖼': (_, instance: IEmbedsEx) => {
            instance.needsPreview = instance.needsPreview ? false : true;

            instance.currentEmbed.setImage(instance.needsPreview ? instance.preview : null);
          }
        });

      Object.assign(embed, {
        assets,
        needsPreview: message.needsPreview,
        preview: template.character ? template.character.preview : (template2 as SoulInfo).character.preview,
        currentClass: typeof template !== 'boolean' ? template.constructor.name : null,
        oldClass: template2 ? template2.constructor.name : null
      });

      if ((releaseWeapon || releases || mex) && template && template2)
        embed.addFunctionEmoji('🔄', (_, instance: IEmbedsEx) => {
          const tmp = instance.currentClass;
          instance.currentClass = instance.oldClass;
          instance.oldClass = tmp;

          if (instance.currentClass)
            instance.preview = instance.assets[instance.currentClass].character.preview;

          instance.setPage(instance.page === 1 ? 2 : 1);

          if (instance.needsPreview)
            instance.currentEmbed.setImage(instance.preview);
        });

      return embed.build();
    } catch (err) { this.emitError(err, message, this, 2); }
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
    const db = await this.acquire(template.character.releases, true, true);
    const infoSub = await this.parseArticle(template.character.releases);

    return new Kamihime(
      this.client,
      await this.handler.prefix(message) as string,
      db.info,
      infoSub
    );
  }

  public async parseWeapon (template: KamihimeInfo) {
    const db = await super.acquire(template.character.releaseWeapon, false, true);
    const infoSub = await this.parseArticle(template.character.releaseWeapon);

    return new Weapon(this.client, null, db.info, infoSub);
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
}

interface IEmbedsEx extends Embeds {
  needsPreview?: boolean;
  preview?: string;
  currentClass?: string;
  oldClass?: string;
  assets?: {
    [name: string]: KamihimeInfo | EidolonInfo | SoulInfo | WeaponInfo
  };
}
