const Info = require('../base/Info');
const { MessageEmbed } = require('discord.js');

class SoulInfo extends Info {
  async format() {
    const { wikiaURI, colors } = this;
    const soul = await this.template();
    const embed = new MessageEmbed()
      .setDescription(
        [
          `__**Soul**__ | __**${soul.type}**__ | __**${soul.weapons[0]}${soul.weapons[1] ? ` and ${soul.weapons[1]}` : ''}**__`,
          soul.souls.length
            ? `__**Requires**__: [__**${
              soul.souls[0]}**__](${wikiaURI}${encodeURI(soul.souls[0])
            }) & [__**${
              soul.souls[1]}**__](${wikiaURI}${encodeURI(soul.souls[1])
            }) at LV 20\n__**Master LV Bonus**__: ${soul.masterBonus}\n${soul.description}`
            : `__**Master LV Bonus**__: ${soul.masterBonus}\n${soul.description}`
        ]
      )
      .setColor(colors[soul.tier]);

    if (soul.soulPoints)
      embed.setFooter(`Soul Points to unlock: ${soul.soulPoints}`);

    return super.format(embed, soul);
  }

  async template() {
    const { character, res } = this;
    const link = this.itemLink;
    const thumbnail = await this.itemPortrait();
    const preview = await this.itemPreview();

    return {
      name: character.name,
      description: character.description,
      link,
      thumbnail,
      preview,
      tier: character.tier,
      type: character.type,
      masterBonus: character.masterBonus,
      soulPoints: character.soulP || null,
      weapons: [
        character.weapon1 || null,
        character.weapon2 || null
      ],
      souls: character.soul1 || character.soul2
        ? [
          character.soul1 || null,
          character.soul2 || null
        ]
        : [],

      burst: {
        name: character.burstName,
        description: character.burstDesc
      },

      abilities: [
        character.ability1Name
          ? {
            name: character.ability1Name,
            description: character.ability1Desc,
            cooldown: character.ability1Cd,
            duration: character.ability1Dur || null
          }
          : null,

        character.ability2Name
          ? {
            name: character.ability2Name,
            description: character.ability2Desc,
            upgradeDescription: '★ [LV 5]',
            cooldown: character.ability2Cd,
            duration: character.ability2Dur || null
          }
          : null,

        character.ability3Name
          ? {
            name: character.ability3Name,
            description: character.ability3Desc,
            upgradeDescription: character.tier === 'Standard' ? '' : '★ [LV 15]',
            cooldown: character.ability3Cd,
            duration: character.ability3Dur || null
          }
          : null
      ],

      assistAbilities: [
        character.assist1Name
          ? {
            name: character.assist1Name,
            description: character.assist1Desc
          }
          : null,
        character.assist2Name
          ? {
            name: character.assist2Name,
            description: character.assist2Desc
          }
          : null
      ],

      harem: res.khHarem_hentai1Resource2
    };
  }
}

module.exports = SoulInfo;
