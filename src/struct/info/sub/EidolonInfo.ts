import { MessageEmbed } from 'discord.js';
import { IKamihimeFandomEidolon, IKamihimeFandomFormatted } from '../../../../typings';
import Info from '../base/Info';

export class EidolonInfo extends Info {
  public character: IKamihimeFandomEidolon;

  public format () {
    const { colors } = this;
    const eidolon = this.template();
    const embed = new MessageEmbed()
      .setDescription(`__**Eidolon**__ | __**${eidolon.element}**__\n${eidolon.description}`)
      .setColor(colors[eidolon.rarity])
      .addField(`Summon: ${eidolon.summon.name} | CD: ${eidolon.summon.cooldown}`, eidolon.summon.description)
      .addField(
        `Effect: ${eidolon.effect.name}`,
        eidolon.effect.description.map((el, i, arr) => {
          if (i === 0) return `${'☆'.repeat(4)} | ${el}`;

          return `${'★'.repeat(i)}${'☆'.repeat(arr.length - (i + 1))} | ${el}`;
        })
        .join('\n')
      );

    return super.format(embed, eidolon);
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
          character.eidolonEffectDes4,
        ]
      },

      obtainedFrom: character.obtained,
      harem: res.harem2Resource2
    } as IKamihimeFandomFormatted;
  }
}
