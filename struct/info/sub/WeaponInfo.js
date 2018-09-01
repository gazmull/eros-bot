const Info = require('../base/Info');
const { MessageEmbed } = require('discord.js');

class WeaponInfo extends Info {
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
    const burstScaleDiscriminator = {
      SSR: '(++++)',
      SR: '(++)',
      R: '(+)'
    };
    const skillParser = {
      Upgrade: {
        SSR: '**Large Chalice of Deceit**: Weapon Enhance skill Lv up chance↑ (++)',
        SR: '**Chalice of Deceit**: Weapon Enhance skill Lv up chance↑ (+)',
        R: '**Vessel of Sorcery**: Weapon Enhance skill Lv up chance↑'
      },
      Assault: 'Characters\' ATK↑',
      Defender: 'Characters\' HP↑',
      Pride: 'Characters with low HP, ATK↑',
      Rush: 'Characters\' Double Attack Rate↑',
      Barrage: 'Characters\' Triple Attack Rate↑',
      Stinger: 'Characters\' Critical Hit Rate↑',
      Exceed: 'Characters\' Burst↑',
      Ascension: 'Characters\' Recovery↑',
      Elaborate: 'Characters\' Ability↑'
    };

    const cleanReleaseLink = `${wikiaURI}${encodeURI(weapon.releases)}`.replace(/(\(|\))/g, '\\$&');
    const elements = weapon.elements.every(e => e) ? weapon.elements.join('/') : weapon.elements[0];
    const embed = new MessageEmbed()
      .setDescription(
        [
          `__**Weapon**__ | __**${weapon.type}**__ | __**${elements}**__${
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
        const index = weapon.skills.indexOf(skill);

        if (/\s/.test(skill)) {
          skill = `**${skill}**: ${weapon.skillDesc[weapon.skills.indexOf(skill)]}`;

          if (weapon.skillFBL[index])
            skill += `\n ★ [Final Break Limit]:\n ${weapon.skillFBL[index]}`;
        } else if (skill === 'Upgrade')
          skill = skillParser.Upgrade[weapon.rarity];
        else
          skill = `**${discriminator[weapon.rarity][weapon.elements[0]]} ${skill}**: ${weapon.elements[0]} ${skillParser[skill]} ${scaleDiscriminator[weapon.rarity]}`;

        list.push(skill);
      }

    if (list.length)
      embed.addField(`Weapon Skill Type${list.length > 1 ? 's' : ''}`, list.join('\n'), true);

    const bursts = [];

    for (let burst of weapon.burstDesc) {
      if (!burst) continue;
      if (weapon.burstFBL)
        burst += `\n ★ [Final Break Limit]:\n ${weapon.burstFBL}`;

      bursts.push(burst);
    }

    if (bursts.length)
      embed.addField(
        'Weapon Burst Effect',
        bursts.map((b, i) =>
          bursts.length > 1
            ? `${'★'.repeat(i)}${'☆'.repeat(bursts.length - 1 - i)} | ${b}\n`
            : b
        )
      );
    else
      embed.addField('Weapon Burst Effect', [
        `${weapon.elements[0]} DMG ${burstScaleDiscriminator[weapon.rarity]}`,
        weapon.burstFBL ? ` ★ [Final Break Limit]:\n ${weapon.burstFBL}` : ''
      ]);

    return super.format(embed, weapon);
  }

  async template() {
    const { character } = this;
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
      type: character.weaponType,
      skills: [
        character.skillType || character.skill || character.skill1
          ? character.skillType || character.skill || character.skill1
          : null,
        character.skillType2 || character.skill2
          ? character.skillType2 || character.skill2
          : null
      ],
      skillFBL: [
        character.skill1Fbl || '',
        character.skill2Fbl || ''
      ],
      skillDesc: [
        character.skillDesc || '',
        character.skill2Desc || ''
      ],
      elements: [
        character.element,
        character.element2,
        character.element3,
        character.element4
      ],
      atk: character.atkMax,
      atkFBL: character.atkFbl,
      hp: character.hpMax,
      hpFBL: character.hpFbl,
      burstFBL: character.burstFbl,
      burstDesc: [
        character.burstDesc ? character.burstDesc : character.burstDesc0 || null,
        character.burstDesc1 || null,
        character.burstDesc2 || null,
        character.burstDesc3 || null
      ],
      obtainedFrom: character.obtained,
      releases: character.releases || null
    };
  }
}

module.exports = WeaponInfo;
