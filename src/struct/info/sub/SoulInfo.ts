import { MessageEmbed } from 'discord.js';
import { IKamihimeFandomFormatted, IKamihimeFandomSoul } from '../../../../typings';
import Info from '../base/Info';

export class SoulInfo extends Info {
  public character: IKamihimeFandomSoul;

  public format () {
    const { fandomURI, colors } = this;
    const soul = this.template();
    const sClassLink = 'https://kamihime-project.fandom.com/wiki/Souls#S_Class';
    const embed = new MessageEmbed()
      .setDescription([
        [
          `__**Soul**__ | __**${soul.type}**__`,
          `| __**${soul.weapons[0]}${soul.weapons[1] ? ` and ${soul.weapons[1]}` : ''}**__`,
        ]
          .join(' '),
        '__**Unlock Conditions**__',
        [
          soul.soulPoints,
          soul.souls.length
            ? `${soul.souls
              .filter(s => s)
              .map(v => `[__**${v}**__](${fandomURI}${encodeURI(v)})`)
              .join(' & ')} at LV 20`
            : '',
          soul.tier ? '' : `Completion of [__**Stage 1 - 5 in Hall of Research**__](${sClassLink})`,
        ]
          .filter(r => r)
          .map(r => `- ${r}`)
          .join('\n'),
        `__**Master LV Bonus**__: ${soul.masterBonus}\n${soul.description}`,
      ])
      .setColor(colors[soul.tier || colors.S]);

    return super.format(embed, soul);
  }

  public formatMex () {
    const { colors } = this;
    const soul = this.template();
    const embed = new MessageEmbed()
      .setColor(colors[soul.tier]);

    for (const m of soul.mex)
      if (m)
        embed.addField(
          [
            `:regional_indicator_m:: ${m.name}`,
            `| __CD__: ${m.cooldown}`,
            m.duration ? `| __D__: ${m.duration}` : '',
          ].join(' '),
          m.description
        );

    if (soul.soulPoints)
      embed.setFooter(`Soul Points to unlock: ${soul.soulPoints}`);

    return super.format(embed, soul, false);
  }

  public template () {
    const { character, res } = this;
    const link = this.itemLink;
    const thumbnail = this.itemPortrait;
    const preview = this.itemPreview;

    return {
      name: character.name,
      description: character.description,
      link,
      thumbnail,
      preview,
      tier: character.tier,
      type: character.type,
      masterBonus: character.masterBonus,
      soulPoints: character.soulP,
      weapons: [
        character.weapon1,
        character.weapon2,
      ],
      souls: [
        character.soul1,
        character.soul2,
      ],

      burst: {
        name: character.burstName,
        description: character.burstDesc
      },

      abilities: [ 1, 2, 3 ].map(a => character[`ability${a}Name`]
        ? {
          name: character[`ability${a}Name`],
          description: character[`ability${a}Desc`],
          upgradeDescription: a === 2
            ? '★ [LV 5]'
            : a === 3
              ? character.tier === 'Standard'
                ? ''
                : '★ [LV 15]'
              : '',
          cooldown: character[`ability${a}Cd`],
          duration: character[`ability${a}Dur`]
        }
        : character[`ability${a}AName`]
          ? [ 'A', 'B', 'C' ]
            .map( s => ({
              name: character[`ability${a}${s}Name`],
              description: character[`ability${a}${s}Desc`],
              cooldown: character[`ability${a}${s}Cd`],
              duration: character[`ability${a}${s}Dur`]
            }) )
          : null),

      assistAbilities: [ 1, 2 ].map(a => character[`assist${a}Name`]
        ? {
          name: character[`assist${a}Name`],
          description: character[`assist${a}Desc`]
        }
        : null),

      mex: [
        character.mex1Name
          ? {
            name: character.mex1Name,
            description: character.mex1Desc,
            cooldown: character.mex1Cd,
            duration: character.mex1Dur
          }
          : null,
        character.mex2Name
          ? {
            name: character.mex2Name,
            description: character.mex2Desc,
            cooldown: character.mex2Cd,
            duration: character.mex2Dur
          }
          : null,
      ],

      harem: res.harem2Resource2
    } as IKamihimeFandomFormatted;
  }
}
