const Info = require('../base/Info');
const { MessageEmbed } = require('discord.js');

class SoulInfo extends Info {
  async format() {
    const { wikiaURI, colors } = this;
    const weapon = await this.template();
    const list = [];
    const discriminator = {
      SSR: {
        Fire: 'Inferno',
        Water: 'Cocytus',
        Wind: 'Turbulence',
        Thunder: 'Impulse',
        Light: 'Lumina',
        Dark: 'Schwarz'
      },
      SR: {
        Fire: 'Burning',
        Water: 'Blizzard',
        Wind: 'Storm',
        Thunder: 'Plasma',
        Light: 'Shine',
        Dark: 'Abyss'
      },
      R: {
        Fire: 'Fire',
        Water: 'Aqua',
        Wind: 'Aero',
        Thunder: 'Thunder',
        Light: 'Ray',
        Dark: 'Dark'
      }
    };
    const scaleDiscriminator = {
      SSR: '(++)',
      SR: '(+)',
      R: ''
    };

    const cleanReleaseLink = `${wikiaURI}${encodeURI(weapon.releases)}`.replace(/(\(|\))/g, '\\$&');
    const embed = new MessageEmbed()
      .setDescription(
        [
          `__**Weapon**__ | __**${weapon.type}**__ | __**${weapon.element}**__${
            weapon.releases
              ? ` | __**[${weapon.releases}](${cleanReleaseLink} "Kamihime Release")**__`
              : ''
          }`,
          `${weapon.description}`
        ]
      )
      .setColor(colors[weapon.rarity]);

    for (let skill of weapon.skills)
      if (skill) {
        if (/\s/.test(skill))
          skill = `**${skill}**: ${weapon.skillDescs[weapon.skills.indexOf(skill)]}`;
        else
        if (skill === 'Upgrade')
          skill = weapon.rarity === 'SSR'
            ? '**Large Chalice of Deceit**: Weapon Enhance skill Lv up chance↑ (++)'
            : weapon.rarity === 'SR'
              ? '**Chalice of Deceit**: Weapon Enhance skill Lv up chance↑ (+)'
              : weapon.rarity === 'R'
                ? '**Vessel of Sorcery**: Weapon Enhance skill Lv up chance↑'
                : null;
        else
          skill = `**${discriminator[weapon.rarity][weapon.element]} ${skill}**: ${
            skill === 'Assault'
              ? `${weapon.element} Characters' ATK↑ ${scaleDiscriminator[weapon.rarity]}`
              : skill === 'Defender'
                ? `${weapon.element} Characters' HP↑ ${scaleDiscriminator[weapon.rarity]}`
                : skill === 'Pride'
                  ? `${weapon.element} Characters with low HP, ATK↑ ${scaleDiscriminator[weapon.rarity]}`
                  : skill === 'Rush'
                    ? `${weapon.element} Characters' Double Attack Rate↑ ${scaleDiscriminator[weapon.rarity]}`
                    : '<undefined skill>'
          }`;

        list.push(skill);
      }

    if (list.length)
      embed.addField(`Weapon Skill Type${list.length > 1 ? 's' : ''}`, list.join('\n'), true);

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
      skillDescs: [
        character.skillDesc ? character.skillDesc : null,
        character.skill2Desc ? character.skill2Desc : null
      ],
      element: character.element,
      atk: character.atkMax,
      hp: character.hpMax,
      burstDesc: character.burstDesc || null,
      obtainedFrom: character.obtained,
      releases: character.releases || null
    };
  }
}

module.exports = SoulInfo;
