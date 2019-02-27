import { MessageEmbed } from 'discord.js';
import Info from '../base/Info';

export default class SoulInfo extends Info {
  public character: IKamihimeFandomSoul;

  public format () {
    const { fandomURI, colors } = this;
    const soul = this.template();
    const embed = new MessageEmbed()
      .setDescription(
        [
          `__**Soul**__ | __**${soul.type}**__ | __**${
            soul.weapons[0]}${soul.weapons[1] ? ` and ${soul.weapons[1]}` : ''}**__`,
          soul.souls.length
            ? `__**Requires**__: [__**${
              soul.souls[0]}**__](${fandomURI}${encodeURI(soul.souls[0])
            }) & [__**${
              soul.souls[1]}**__](${fandomURI}${encodeURI(soul.souls[1])
            }) at LV 20\n__**Master LV Bonus**__: ${soul.masterBonus}\n${soul.description}`
            : `__**Master LV Bonus**__: ${soul.masterBonus}\n${soul.description}`,
        ]
      )
      .setColor(colors[soul.tier]);

    if (soul.soulPoints)
      embed.setFooter(`Soul Points to unlock: ${soul.soulPoints}`);

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
      soulPoints: character.soulP || null,
      weapons: [
        character.weapon1 || null,
        character.weapon2 || null,
      ],
      souls: character.soul1 || character.soul2
        ? [
          character.soul1 || null,
          character.soul2 || null,
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
          : null,
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
          : null,
      ],

      mex: [
        character.mex1Name
          ? {
            name: character.mex1Name,
            description: character.mex1Desc,
            cooldown: character.mex1Cd,
            duration: character.mex1Dur || null
          }
          : null,
        character.mex2Name
          ? {
            name: character.mex2Name,
            description: character.mex2Desc,
            cooldown: character.mex2Cd,
            duration: character.mex2Dur || null
          }
          : null,
      ],

      harem: res.harem2Resource2
    } as IKamihimeFandomFormatted;
  }
}
