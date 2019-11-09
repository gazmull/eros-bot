import { MessageEmbed } from 'discord.js';
import { IKamihimeFandomFormatted, IKamihimeFandomKamihime } from '../../../../typings';
import Info from '../base/Info';

export class KamihimeInfo extends Info {
  public character: IKamihimeFandomKamihime;

  public format () {
    const { fandomURI, colors } = this;
    const hime = this.template();
    const embed = new MessageEmbed()
      .setDescription(
        [
          `__**Kamihime**__ | __**${hime.type}**__ | __**${hime.element}**__${
            hime.releaseWeapon
              ? ` | __**[${hime.releaseWeapon}](${fandomURI}${encodeURI(hime.releaseWeapon)} "Weapon Release")**__`
              : ''}`,
          hime.favouriteWeapon ? `__**Favourite Weapon Type: ${hime.favouriteWeapon}**__\n` : '' + hime.description,
        ]
      )
      .setColor(hime.rarity === 'SSR+' ? colors.SSRA : colors[hime.rarity]);

    return super.format(embed, hime);
  }

  public template () {
    const { character, res } = this;
    const link = this.itemLink;
    const thumbnail = this.itemPortrait;
    const preview = this.itemPreview;
    const burstDescParse = () => {
      switch (character.rarity) {
        default: return `${character.element} DMG (5.5x Burst DMG)`;
        case 'SSR': return `${character.element} DMG (4.5x Burst DMG)`;
        case 'SR': return `${character.element} DMG (3x Burst DMG)`;
        case 'R': return `${character.element} DMG (2x Burst DMG)`;
      }
    };
    const abilityDescParse = (desc: string, ability: number) => {
      switch (character.rarity) {
        default:
          switch (ability) {
            default: return ` ★ [LV 65]: ${desc}`;
            case 2: return ` ★ [LV 75]: ${desc}`;
            case 3: return ` ★ [LV 45]: ${desc}`;
            case 4: return ` ★ [LV 55]: ${desc}`;
          }
        case 'SSR':
          switch (ability) {
            default: return ` ★ [LV 55]: ${desc}`;
            case 2: return ` ★ [LV 75]: ${desc}`;
            case 3: return ' ★ [LV 45]';
          }
        case 'SR':
          switch (ability) {
            default: return ` ★ [LV 45]: ${desc}`;
            case 2: return ` ★ [LV 65]: ${desc}`;
            case 3: return ' ★ [LV 35]';
          }
        case 'R':
          switch (ability) {
            default: return ` ★ [LV 45]: ${desc}`;
            case 2: return ' ★ [LV 25]';
          }
      }
    };

    return {
      name: character.name,
      description: character.description,
      releaseWeapon: character.releaseWeapon || null,
      favouriteWeapon: character.favouriteWeapon || null,
      link,
      thumbnail,
      preview,
      rarity: character.rarity,
      element: character.element,
      type: character.type,
      atk: character.atkMax,
      hp: character.hpMax,

      burst: {
        name: character.burstName,
        description: character.burstDesc
          ? (character.burstDesc.startsWith(character.element)
            ? character.burstDesc
            : `${burstDescParse()} and ${character.burstDesc}`)
          : burstDescParse(),
        upgradeDescription: (
          character.rarity === 'SSR+'
            ? null
            : character.rarity === 'SSR'
              ? `[LB ★★★☆] ${character.burstPowerupDesc ? character.burstPowerupDesc : 'Increases to 5x Burst DMG'}`
              : character.rarity === 'SR'
                ? `[LB ★★★☆] ${character.burstPowerupDesc ? character.burstPowerupDesc : 'Increases to 3.5x Burst DMG'}`
                : `[LB ★★☆] ${character.burstPowerupDesc ? character.burstPowerupDesc : 'Increases to 2.5x Burst DMG'}`
        )
      },

      abilities: [
        character.ability1Name
          ? {
            name: character.ability1Name,
            description: character.ability1Desc,
            upgradeDescription: character.ability1PowerupDesc
              ? abilityDescParse(character.ability1PowerupDesc, 1)
              : null,
            cooldown: character.ability1Cd,
            duration: character.ability1Dur || null
          }
          : null,

        character.ability2Name
          ? {
            name: character.ability2Name,
            description: character.ability2Desc,
            upgradeDescription: character.ability2PowerupDesc
              ? abilityDescParse(character.ability2PowerupDesc, 2)
              : null,
            cooldown: character.ability2Cd,
            duration: character.ability2Dur || null
          }
          : null,

        character.ability3Name
          ? {
            name: character.ability3Name,
            description: character.ability3Desc,
            upgradeDescription: character.ability3PowerupDesc || [ 'SSR', 'SR' ].includes(character.rarity)
              ? abilityDescParse(character.ability3PowerupDesc, 3)
              : null,
            cooldown: character.ability3Cd,
            duration: character.ability3Dur || null
          }
          : null,

        character.ability4Name
          ? {
            name: character.ability4Name,
            description: [
              character.ability4Desc,
              '★ [LV 45]',
            ].join('\n'),
            cooldown: character.ability4Cd,
            duration: character.ability4Dur || null
          }
          : null,
      ],

      assistAbilities: [
        character.assistName
          ? {
            name: character.assistName,
            description: character.assistDesc,
            upgrades: [
              character.assistPowerupDesc
                ? abilityDescParse(character.assistPowerupDesc, 4)
                : null,
              character.assistPowerup2Desc
                ? abilityDescParse(character.assistPowerup2Desc, 2)
                : null,
            ]
          }
          : null,
        character.assist2Name
          ? {
            name: character.assist2Name,
            description: [
              character.assist2Desc,
              character.ability4Name
                ? '★ [LV 55]'
                : character.rarity === 'SSR+'
                  ? '★ [LV 75]'
                  : null,
            ].join('\n'),
            upgrades: [
              character.assist2PowerupDesc
                ? abilityDescParse(character.assist2PowerupDesc, 4)
                : null,
              character.assist2Powerup2Desc
                ? abilityDescParse(character.assist2Powerup2Desc, 2)
                : null,
            ]
          }
          : null,
      ],

      obtainedFrom: character.obtained,
      harem: res.harem2Resource2 || res.harem3Resource2
    } as IKamihimeFandomFormatted;
  }
}
