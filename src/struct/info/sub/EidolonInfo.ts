import { EmbedFieldData, MessageEmbed } from 'discord.js';
import { IKamihimeFandomEidolon, IKamihimeFandomFormatted } from '../../../../typings';
import Info from '../base/Info';

const suffixes = [ 0, 1, 2, 3, 4 ];

export class EidolonInfo extends Info {
  public character: IKamihimeFandomEidolon;

  public format () {
    const { colors } = this;
    const eidolon = this.template();
    const mappedLBUpgrades = <T> (arr: string | T[]) =>
      Array.isArray(arr)
        ? arr.map((el, i, arr) => `${'★'.repeat(i)}${'☆'.repeat(arr.length - (i ? i + 1 : 1))} | ${el}`)
        : arr;

    const formattedSummonField: () => EmbedFieldData = () => {
      const { cooldown, duration, description } = eidolon.summon;
      const nameCD = typeof cooldown === 'string' ? ` | CD: ${cooldown}` : '';
      const nameDur = typeof duration === 'string' ? ` | D: ${duration}`: '';
      const valueCD = (i: number) => !cooldown ? '' : typeof cooldown === 'string' ? cooldown : cooldown[i];
      const valueDur = (i: number) => !duration ? '' : typeof duration === 'string' ? duration : ` | D: ${duration[i]}`;

      return {
        name: `🇸: ${eidolon.summon.name}${nameCD}${nameDur}`,
        value: typeof description === 'string'
          ? description
          : mappedLBUpgrades(description.map((el, i) =>
            `${el} (CD: ${valueCD(i)}${valueDur(i)})`))
      };
    };
    const embed = new MessageEmbed()
      .setDescription(`__**Eidolon**__ | __**${eidolon.element}**__\n${eidolon.description}`)
      .setColor(colors[eidolon.rarity])
      .addFields(formattedSummonField())
      .addField(`🇪: ${eidolon.effect.name}`, mappedLBUpgrades(eidolon.effect.description));

    if (eidolon.subEffect.name)
      embed.addField(
        `🇸 🇪: ${eidolon.subEffect.name}`,
        mappedLBUpgrades(eidolon.subEffect.description)
      );

    return super.format(embed, eidolon);
  }

  public template () {
    const { character, res } = this;
    const link = this.itemLink;
    const thumbnail = this.itemPortrait;
    const preview = this.itemPreview;

    const mappedSimpleCDur = (prop: string) => suffixes.map(e => this.simpleCDur(character[`${prop}${e}`]));

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
        description: character.summonAtkDes || suffixes.map(e => character[`summonAtkDes${e}`]),
        cooldown: character.summonCd0
          ? mappedSimpleCDur('summonCd')
          : this.simpleCDur(character.summonCd),
        duration: character.summonEffectDur0
          ? mappedSimpleCDur('summonEffectDur')
          : character.summonEffectDur
            ? this.simpleCDur(character.summonEffectDur)
            : null
      },

      effect: {
        name: character.eidolonEffect,
        description: suffixes.map(e => character[`eidolonEffectDes${e}`])
      },

      subEffect: {
        name: character.eidolonSubEffect,
        description: character.eidolonSubEffectDes || suffixes.map(e => character[`eidolonSubEffectDes${e}`])
      },

      obtainedFrom: character.obtained,
      harem: res.harem2Resource2
    } as IKamihimeFandomFormatted;
  }
}
