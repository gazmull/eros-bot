const Info = require('../base/Info');
const { MessageEmbed } = require('discord.js');

class SoulInfo extends Info {
  async format() {
    const { colors } = this;
    const weapon = await this.template();
    const embed = new MessageEmbed()
      .setDescription(
        [
          `__**Weapon**__ | __**${weapon.type.weapon}**__ | __**${weapon.element}**__`,
          `${weapon.description}`
        ]
      )
      .setColor(colors[weapon.rarity])
      .addField('Maximum Stats', `ATK: ${weapon.atk} | HP: ${weapon.hp}`, true);

    if (weapon.type.skill)
      embed.addField('Weapon Skill Type', weapon.type.skill, true);

    if (weapon.burstDesc)
      embed.addField('Weapon Burst', weapon.burstDesc, true);

    return super.format(embed, weapon);
  }

  async template() {
    const { character } = this;
    const link = this.itemLink;
    const thumbnail = await this.itemPortrait();

    return {
      name: character.name,
      description: character.description,
      link,
      thumbnail,
      rarity: character.rarity,
      type: {
        weapon: character.weaponType,
        skill: character.skillType || null
      },
      element: character.element,
      atk: character.atkMax,
      hp: character.hpMax,
      burstDesc: character.burstDesc || null,
      obtainedFrom: character.obtained
    };
  }
}

module.exports = SoulInfo;