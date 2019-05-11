import { MessageEmbed } from 'discord.js';
import { IKamihimeFandomFormatted, IKamihimeFandomWeapon } from '../../../../typings';
import Info from '../base/Info';

export class WeaponInfo extends Info {
  public character: IKamihimeFandomWeapon;

  public format () {
    const weapon = this.template();
    const embed = this.generateEmbed(weapon);
    const skills = weapon.skill.filter(el => el);

    if (skills.length) {
      const formattedSkills = skills.map(skill => {
        if (/\s/.test(skill.name))
          return `**${skill.name}**: ${skill.description}`;
        else if (skill.name === 'Upgrade')
          return skillParser.Upgrade[weapon.rarity];

        return [
          `**${discriminator[weapon.rarity][weapon.elements[0]]} ${skill.name}**:`,
          weapon.elements[0],
          skillParser[skill.name],
          scaleDiscriminator[weapon.rarity],
        ].join(' ');
      });

      embed.addField(`Weapon Skill Type${skills.length > 1 ? 's' : ''}`, formattedSkills, true);
    }

    const bursts = weapon.burstDesc.filter(el => el);
    const formattedBurst = `${weapon.elements[0]} DMG ${burstScaleDiscriminator[weapon.rarity]}`;

    if (bursts.length) {
      const formattedBursts = bursts.map((b, i) =>
        bursts.length > 1
          ? `${'★'.repeat(i)}${'☆'.repeat(bursts.length - 1 - i)} | ${b}\n`
          : `${formattedBurst} and ${b}`
      );

      embed.addField('Weapon Burst Effect', formattedBursts);
    } else
      embed.addField('Weapon Burst Effect', formattedBurst);

    return super.format(embed, weapon);
  }

  public formatFLB () {
    const weapon = this.template();
    const embed = this.generateEmbed(weapon, true);

    embed.addField('Maximum Basic Stats', `**HP: ${weapon.hpFLB}** | **ATK: ${weapon.atkFLB}**`);

    const skillFlbs = weapon.skillFLB.filter(el => el);

    if (skillFlbs.length)
      embed.addField(
        `Weapon Skill Type${skillFlbs.length > 1 ? 's' : ''}`,
        skillFlbs.map(skill => {
          if (/\s/.test(skill.name))
            return `**${skill.name}**: ${skill.description}`;

          return [
            `**${discriminator[weapon.rarity][weapon.elements[0]]} ${skill.name}**:`,
            weapon.elements[0],
            skillParser[skill.name],
            scaleDiscriminator[weapon.rarity],
          ].join(' ');
        }).join('\n'),
        true
      );

    if (weapon.burstFLB)
      embed.addField('Weapon Burst Effect', weapon.burstFLB);
    else
      embed.addField('Weapon Burst Effect', `${weapon.elements[0]} DMG ${burstScaleDiscriminator[weapon.rarity]}`);

    return super.format(embed, weapon);
  }

  protected generateEmbed (weapon: IKamihimeFandomFormatted, flb = false) {
    const { fandomURI, colors } = this;
    const cleanReleaseLink = `${fandomURI}${encodeURI(weapon.releases)}`.replace(/(\(|\))/g, '\\$&');
    const elements = weapon.elements.every(e => Boolean(e)) ? weapon.elements.join('/') : weapon.elements[0];
    const embed = new MessageEmbed()
      .setDescription(
        [
          `${
            flb
              ? `${this.client.config.emojis['SSR+']} `
              : ''
          }__**Weapon**__ | __**${weapon.type}**__ | __**${elements}**__${
            weapon.releases
              ? ` | __**[${weapon.releases}](${cleanReleaseLink} "Kamihime Release")**__`
              : ''
          }`,
          weapon.description,
        ]
      )
      .setColor(colors[flb ? 'SSRA' : weapon.rarity]);

    return embed;
  }

  public template () {
    const { character } = this;
    const link = this.itemLink;
    const thumbnail = this.itemPortrait;
    const preview = this.itemPreview;

    return {
      name: character.name,
      description: character.description,
      link,
      thumbnail,
      preview,
      rarity: character.rarity,
      type: character.weaponType,
      skill: [
        character.skillType || character.skill || character.skill1
          ? { name: character.skillType || character.skill || character.skill1, description: character.skillDesc }
          : null,
        character.skillType2 || character.skill2
          ? { name: character.skillType2 || character.skill2, description: character.skill2Desc }
          : null,
      ],
      skillFLB: [
        character.skillFlb
          ? { name: character.skillFlb, description: character.skillFlbDesc }
          : character.skillType || character.skill || character.skill1
            ? { name: character.skillType || character.skill || character.skill1, description: character.skillDesc }
            : null,
        character.skill2Flb
          ? { name: character.skill2Flb, description: character.skill2FlbDesc }
          : character.skillType2 || character.skill2
            ? { name: character.skillType2 || character.skill2, description: character.skill2Desc }
            : null,
      ],
      elements: [
        character.element,
        character.element2,
        character.element3,
        character.element4,
        character.element5,
        character.element6,
      ],
      atk: character.atkMax,
      atkFLB: character.atkFlb,
      hp: character.hpMax,
      hpFLB: character.hpFlb,
      burstFLB: character.burstFlbDesc,
      burstDesc: [
        character.burstDesc ? character.burstDesc : character.burstDesc0 || null,
        character.burstDesc1 || null,
        character.burstDesc2 || null,
        character.burstDesc3 || null,
      ],
      obtainedFrom: character.obtained,
      releases: character.releases || null
    } as IKamihimeFandomFormatted;
  }
}

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
