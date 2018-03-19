const Info = require('../base/Info');
const { MessageEmbed } = require('discord.js');

class KamihimeInfo extends Info {
  async format() {
    const { wikiaURI, colors } = this;
    const hime = await this.template();
    const embed = new MessageEmbed()
      .setDescription(
        [
          `__**Kamihime**__ | __**${hime.type}**__ | __**${hime.element}**__${
            hime.releaseWeapon
              ? ` | __**[${hime.releaseWeapon}](${wikiaURI}${encodeURI(hime.releaseWeapon)} "Weapon Release")**__`
              : ''}`,
          `${hime.favouriteWeapon ? `__**Favourite Weapon Type: ${hime.favouriteWeapon}**__\n` : ''}${hime.description}`
        ]
      )
      .setColor(hime.rarity === 'SSR+' ? colors.SSRA : colors[hime.rarity]);

    return super.format(embed, hime);
  }

  async template() {
    const { character, res } = this;
    const link = this.itemLink;
    const thumbnail = await this.itemPortrait();
    const burstDescParse = () => {
      switch (character.rarity) {
        default:
          return `${character.element} DMG (++++)`;
        case 'SR':
          return `${character.element} DMG (++)`;
        case 'R':
          return `${character.element} DMG (+)`;
      }
    };
    const abilityDescParse = (desc, ability) => {
      switch (character.rarity) {
        default:
          switch (ability) {
            default:
              return ` ★ [LV 65]: ${desc}`;
            case 2:
              return ` ★ [LV 75]: ${desc}`;
            case 3:
              return ` ★ [LV 45]: ${desc}`;
          }
        case 'SSR':
          switch (ability) {
            default:
              return ` ★ [LV 55]: ${desc}`;
            case 2:
              return ` ★ [LV 75]: ${desc}`;
            case 3:
              return ' ★ [LV 45]';
          }
        case 'SR':
          switch (ability) {
            default:
              return ` ★ [LV 45]: ${desc}`;
            case 2:
              return ` ★ [LV 65]: ${desc}`;
            case 3:
              return ' ★ [LV 35]';
          }
        case 'R':
          switch (ability) {
            default:
              return ` ★ [LV 45]: ${desc}`;
            case 2:
              return ' ★ [LV 25]';
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
      rarity: character.rarity,
      element: character.element,
      type: character.type,
      atk: character.atkMax,
      hp: character.hpMax,

      burst: {
        name: character.burstName,
        description: character.burstDesc || burstDescParse(),
        upgradeDescription: character.burstPowerupDesc || (
          character.rarity === 'SSR+'
            ? null
            : character.rarity === 'R'
              ? '[LB ★★☆]: Powered Up'
              : '[LB ★★★☆]: Powered Up'
        )
      },

      abilities: [
        character.ability1Name
          ? {
            name: character.ability1Name,
            description: character.ability1Desc,
            upgradeDescription: abilityDescParse(character.ability1PowerupDesc, 1),
            cooldown: character.ability1Cd,
            duration: character.ability1Dur || null
          }
          : null,

        character.ability2Name
          ? {
            name: character.ability2Name,
            description: character.ability2Desc,
            upgradeDescription: abilityDescParse(character.ability2PowerupDesc, 2),
            cooldown: character.ability2Cd,
            duration: character.ability2Dur || null
          }
          : null,

        character.ability3Name
          ? {
            name: character.ability3Name,
            description: character.ability3Desc,
            upgradeDescription: abilityDescParse(character.ability3PowerupDesc, 3),
            cooldown: character.ability3Cd,
            duration: character.ability3Dur || null
          }
          : null
      ],

      assistAbilities: [
        character.assistName
          ? {
            name: character.assistName,
            description: character.assistDesc
          }
          : null
      ],

      obtainedFrom: character.obtained,
      harem: res.khHarem_hentai1Resource2 || res.khHarem_hentai2Resource2
    };
  }
}

module.exports = KamihimeInfo;
