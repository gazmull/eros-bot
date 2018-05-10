const Info = require('../base/Info');
const { MessageEmbed } = require('discord.js');

class SoulInfo extends Info {
  async format() {
    const { colors } = this;
    const weapon = await this.template();
    const list = [];
    const embed = new MessageEmbed()
      .setDescription(
        [
          `__**Weapon**__ | __**${weapon.type}**__ | __**${weapon.element}**__`,
          `${weapon.description}`
        ]
      )
      .setColor(colors[weapon.rarity]);

    for (const skill of weapon.skills)
      if (skill)
        list.push(skill);

    if (list.length)
      embed.addField(`Weapon Skill Type${list.length > 1 ? 's' : ''}`, list.join(', '), true);

    if (weapon.burstDesc)
      embed.addField('Weapon Burst Effect', weapon.burstDesc, true);

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
      type: character.weaponType,
      skills: [
        character.skillType || character.skill || character.skill1
          ? character.skillType || character.skill || character.skill1
          : null,
        character.skillType2 || character.skill2
          ? character.skillType2 || character.skill2
          : null
      ],
      element: character.element,
      atk: character.atkMax,
      hp: character.hpMax,
      burstDesc: character.burstDesc || null,
      obtainedFrom: character.obtained
    };
  }
}

module.exports = SoulInfo;
