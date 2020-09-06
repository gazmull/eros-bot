import { MessageEmbed } from 'discord.js';
import { IKamihimeFandomFormatted, IKamihimeFandomWeapon } from '../../../../typings';
import toTitleCase from '../../../util/toTitleCase';
import Info from '../base/Info';

export class WeaponInfo extends Info {
  public character: IKamihimeFandomWeapon;

  public format () {
    const weapon = this.template();
    const embed = this.generateEmbed(weapon);
    const skills = weapon.skill.filter(el => el);

    if (skills.length) {
      const formattedSkills = skills.map(skill => {
        if (skill.name === 'Upgrade')
          return skillParser.Upgrade[weapon.rarity];

        const notAWord = /\s/.test(skill.name);

        if (notAWord && skill.description)
          return `**${skill.name}**: ${skill.description}`;
        else if (notAWord && !skill.description) {
          const re = /\w+/g;
          const name = toTitleCase(re.exec(skill.name)[0]);
          const scale = re.exec(skill.name)[0].toUpperCase();

          return [
            `**${elementScaleDiscriminator[scale][weapon.element]} ${name}**:`,
            weapon.element,
            'Characters\'',
            skillParser[name],
            scaleDiscriminator[scale],
          ].join(' ');
        }

        return [
          `**${elementScaleDiscriminatorStatic[weapon.rarity][weapon.element]} ${skill.name}**:`,
          weapon.element,
          'Characters\'',
          skillParser[skill.name],
          rarityScaleDiscriminator[weapon.rarity],
        ].join(' ');
      });

      embed.addField(`Weapon Skill Type${skills.length > 1 ? 's' : ''}`, formattedSkills, true);
    }

    const bursts = weapon.burstDesc.filter(el => el);
    const formattedBurst = `${weapon.element} DMG ${burstScaleParser(weapon)}`;
    const parsedBurstScale = burstScaleParser(weapon.element === 'All' ? 'Relic' : weapon, true);

    if (bursts.length) {
      const formattedBursts = bursts.map((b, i) =>
        bursts.length > 1
          ? `${'★'.repeat(i)}${'☆'.repeat(bursts.length - 1 - i)} | ${b}\n`
          : [
            `${formattedBurst} and ${b}`,
            parsedBurstScale,
          ].join('\n')
      );

      embed.addField('Weapon Burst Effect', formattedBursts);
    } else
      embed.addField('Weapon Burst Effect', [ formattedBurst, parsedBurstScale ]);

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
          const notAWord = /\s/.test(skill.name);

          if (notAWord && skill.description)
            return `**${skill.name}**: ${skill.description}`;
          else if (notAWord && !skill.description) {
            const re = /\w+/g;
            const name = toTitleCase(re.exec(skill.name)[0]);
            const scale = re.exec(skill.name)[0].toUpperCase();

            return [
              `**${elementScaleDiscriminator[scale][weapon.element]} ${name}**:`,
              weapon.element,
              'Characters\'',
              skillParser[name],
              scaleDiscriminator[scale],
            ].join(' ');
          }

          return [
            `**${elementScaleDiscriminatorStatic[weapon.rarity][weapon.element]} ${skill.name}**:`,
            weapon.element,
            'Characters\'',
            skillParser[skill.name],
            rarityScaleDiscriminator[weapon.rarity],
          ].join(' ');
        }).join('\n'),
        true
      );

    if (weapon.burstFLBDesc)
      embed.addField('Weapon Burst Effect', weapon.burstFLBDesc);
    else {
      const bursts = weapon.burstDesc.filter(el => el);
      const formattedBurst = `${weapon.element} DMG ${burstScaleParser('SSR+')}`;

      if (bursts.length) {
        const formattedBursts = bursts.map(b => `${formattedBurst} and ${b}`);

        embed.addField('Weapon Burst Effect', formattedBursts);
      } else
        embed.addField('Weapon Burst Effect', formattedBurst);
    }

    return super.format(embed, weapon);
  }

  protected generateEmbed (weapon: IKamihimeFandomFormatted, flb = false) {
    const { fandomURI, colors } = this;
    const cleanReleaseLink = `${fandomURI}${encodeURI(weapon.releases)}`.replace(/(\(|\))/g, '\\$&');
    const element = weapon.element === 'All' ? 'All Elements' : weapon.element;
    const embed = new MessageEmbed()
      .setDescription(
        [
          `${
            flb
              ? `${this.client.config.emojis['SSR+']} `
              : ''
          }__**Weapon**__ | __**${weapon.type}**__ | __**${element}**__${
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
        character.skillType || character.skill
          ? { name: character.skillType || character.skill, description: character.skillDesc }
          : null,
        character.skill2Type || character.skill2
          ? { name: character.skill2Type || character.skill2, description: character.skill2Desc }
          : null,
      ],
      skillFLB: [
        character.skillFlbType || character.skillFlb
          ? { name: character.skillFlbType || character.skillFlb, description: character.skillFlbDesc }
          : character.skillType || character.skill
            ? { name: character.skillType || character.skill, description: character.skillDesc }
            : null,
        character.skill2FlbType || character.skill2Flb
          ? { name: character.skill2FlbType || character.skill2Flb, description: character.skill2FlbDesc }
          : character.skill2Type || character.skill2
            ? { name: character.skill2Type || character.skill2, description: character.skill2Desc }
            : null,
      ],
      element: character.element,
      atk: character.atkMax,
      atkFLB: character.atkFlb,
      hp: character.hpMax,
      hpFLB: character.hpFlb,
      burstFLBDesc: character.burstFlbDesc,
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

const elementScaleDiscriminatorStatic = {
  XL: {
    Fire: 'Prominence',
    Water: 'Glaciate',
    Thunder: 'Lightning',
    Wind: 'Tempest',
    Light: 'Sacred',
    Dark: 'Eclipse'
  },
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
const rarityScaleDiscriminator = {
  SSR: '(Large)',
  SR: '(Medium)',
  R: '(Small)'
};
const scaleDiscriminator = {
  XL: '(Extra Large)',
  L: '(Large)',
  M: '(Medium)',
  S: '(Small)'
};
const elementScaleDiscriminator = {
  XL: elementScaleDiscriminatorStatic.XL,
  L: elementScaleDiscriminatorStatic.SSR,
  M: elementScaleDiscriminatorStatic.SR,
  S: elementScaleDiscriminatorStatic.R
};
const burstScaleDiscriminator = {
  'SSR+': 5,
  Relic: 4.5,
  SSR: 4,
  SR: 3,
  R: 2,
  N: 1
};
const burstScaleParser = (weapon: IKamihimeFandomFormatted | string, lb2 = false) =>
  `${lb2
  /* eslint-disable @typescript-eslint/ban-ts-comment */
  // @ts-ignore
    ? ` ★ [LB ★★☆] ${weapon.element} DMG `
  // @ts-ignore
    : ''}(x${burstScaleDiscriminator[weapon.rarity || weapon] + (lb2 ? 0.5 : 0)} Burst DMG)`;
const skillParser = {
  // Grail
  Upgrade: {
    SSR: '**Large Chalice of Deceit**: Weapon Enhance skill Lv up chance↑ (Large)',
    SR: '**Chalice of Deceit**: Weapon Enhance skill Lv up chance↑ (Medium)',
    R: '**Vessel of Sorcery**: Weapon Enhance skill Lv up chance↑ (Small)'
  },

  // Simple
  Ascension: 'Recovery↑',
  Assault: 'ATK↑',
  Barrage: 'Triple Attack Rate↑',
  Defender: 'HP↑',
  Elaborate: 'Ability↑',
  Exceed: 'Burst↑',
  Pride: 'ATK↑ commensurate to HP lost ratio',
  Rush: 'Double Attack Rate↑',
  Stinger: 'Critical Hit Rate↑',
  Technica: 'Normal ATK↑',
  Vigoras: 'ATK↑ commensurate to HP left ratio',

  // Composite
  Amplifier: 'ATK↑ & Ability DMG↑',
  Avalanche: 'Combo Attack Rate↑',
  Grace: 'Max HP & Recovery↑',
  Magnate: 'Max HP↑ & Normal ATK↑',
  Parkup: 'Max HP↑ & Crit Rate↑',
  Rampart: 'Max HP↑ & ATK↑ commensurate to HP left ratio',
  Resilience: 'ATK↑ & Recovery↑',
  Slug: 'ATK↑ & Crit Rate↑',
  Sprout: 'Recovery↑ & DMG↑ to commensurate to HP left ratio',
  Stewart: 'Max HP↑ & ATK↑ commensurate to HP lost ratio',
  Strength: 'ATK↑ & Max HP↑',
  Tactics: 'Burst↑ & Ability DMG↑',
  Transcend: 'ATK↑ & Burst↑',
  Triedge: 'ATK↑ & Triple Attack Rate↑',
  Triguard: 'Max HP↑ & Triple Attack Rate↑',
  Twinedge: 'ATK↑ & Double Attack Rate↑',
  Twinguard: 'Max HP↑ & Double Attack Rate↑'
};
