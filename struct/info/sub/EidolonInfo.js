const Info = require('../base/Info');
const { MessageEmbed } = require('discord.js');

class EidolonInfo extends Info {
  async format() {
    const { colors } = this;
    const eidolon = await this.template();
    const embed = new MessageEmbed()
      .setDescription(
        [
          `__**Eidolon**__ | __**${eidolon.element}**__`,
          `${eidolon.description}`
        ]
      )
      .setColor(colors[eidolon.rarity])
      .addField(
        `Summon: ${eidolon.summon.name} | CD: ${eidolon.summon.cooldown}`,
        eidolon.summon.description
      )
      .addField(`Effect: ${eidolon.effect.name}`,
        this.parseStars(eidolon.effect.description).join('\n')
      );

    return super.format(embed, eidolon);
  }

  parseStars(desc) {
    const result = [];

    for (let i = 0; i < desc.length; i++) {
      if (i === 0) {
        result.push(`${'☆'.repeat(4)} | ${desc[i]}`);
        continue;
      }
      result.push(
        `${'★'.repeat(i)}${
          '☆'.repeat(
            i === 1
              ? 3
              : i === 2
                ? 2
                : i === 3
                  ? 1
                  : 0
          )} | ${desc[i]}`
      );
    }

    return result;
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
      rarity: character.rarity,
      element: character.element,
      atk: character.atkMax,
      hp: character.hpMax,

      summon: {
        name: character.summonAtk,
        description: character.summonAtkDes.replace(/\n/g, '\n\n'),
        cooldown: character.summonCd
      },

      effect: {
        name: character.eidolonEffect,
        description: [
          character.eidolonEffectDes0,
          character.eidolonEffectDes1,
          character.eidolonEffectDes2,
          character.eidolonEffectDes3,
          character.eidolonEffectDes4
        ]
      },

      obtainedFrom: character.obtained,
      harem: res.khHarem_hentai1Resource2
    };
  }
}

module.exports = EidolonInfo;
