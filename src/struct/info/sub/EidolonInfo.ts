import { EmbedFieldData, MessageEmbed } from 'discord.js';
import { IKamihimeFandomEidolon, IKamihimeFandomFormatted } from '../../../../typings';
import Info from '../base/Info';

const suffixes = [ 0, 1, 2, 3, 4 ];

export class EidolonInfo extends Info {
  public character: IKamihimeFandomEidolon;

  public format () {
    const eidolon = this.template();
    const embed = this.generateEmbed(eidolon);

    embed
      .addFields(this.generateSummonFields(eidolon) as EmbedFieldData)
      .addField(`🇪: ${eidolon.effect.name}`, this.mapLBUpgrades(eidolon.effect.description));

    if (eidolon.subEffect.name)
      embed.addField(
        `🇸 🇪: ${eidolon.subEffect.name}`,
        this.mapLBUpgrades(eidolon.subEffect.description)
      );

    return super.format(embed, eidolon);
  }

  public formatFLB () {
    const eidolon = this.template();
    const embed = this.generateEmbed(eidolon, true);

    embed
      .addField('Maximum Basic Stats', `**HP: ${eidolon.hpFLB}** | **ATK: ${eidolon.atkFLB}**`)
      .addFields(this.generateSummonFields(eidolon, true) as EmbedFieldData)
      .addField(`🇪: ${eidolon.effectFLB.name}`, this.mapLBUpgrades(eidolon.effectFLB.description));

    if (eidolon.subEffectFLB.name)
      embed.addField(
        `🇸 🇪: ${eidolon.subEffectFLB.name}`,
        this.mapLBUpgrades(eidolon.subEffectFLB.description)
      );

    return super.format(embed, eidolon);
  }

  public generateEmbed (eidolon: IKamihimeFandomFormatted, flb = false) {
    const { colors } = this;
    const flbEmoji = flb ? this.client.config.emojis['SSR+'] : '';
    const embed = new MessageEmbed()
      .setDescription(`${flbEmoji}__**Eidolon**__ | __**${eidolon.element}**__\n${eidolon.description}`)
      .setColor(colors[flb ? 'SSRA' : eidolon.rarity]);

    return embed;
  }

  protected generateSummonFields (eidolon: IKamihimeFandomFormatted, flb = false): EmbedFieldData {
    const summon = eidolon[`summon${flb ? 'FLB' : ''}`] as IKamihimeFandomFormatted['summon'];
    const { cooldown, duration, description } = summon;
    const nameCD = typeof cooldown === 'string' ? ` | CD: ${cooldown}` : '';
    const nameDur = typeof duration === 'string' ? ` | D: ${duration}`: '';
    const valueCD = (i: number) => !cooldown ? '' : typeof cooldown === 'string' ? cooldown : cooldown[i];
    const valueDur = (i: number) => !duration ? '' : typeof duration === 'string' ? duration : ` | D: ${duration[i]}`;
    const name = `🇸: ${summon.name}${nameCD}${nameDur}`;

    return {
      name,
      value: typeof description === 'string'
        ? description
        : this.mapLBUpgrades(description.map((el, i) =>
          `${el} (CD: ${valueCD(i)}${valueDur(i)})`))
    };
  }

  protected mapLBUpgrades<T> (arr: string | T[]) {
    return Array.isArray(arr)
      ? arr.map((el, i, arr) => `${'★'.repeat(i)}${'☆'.repeat(arr.length - (i ? i + 1 : 1))} | ${el}`)
      : arr;
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

      atkFLB: character.atkFlb,
      hpFLB: character.hpFlb,

      summonFLB: {
        name: character.summonAtk,
        description: character.summonAtkDesFlb || character.summonAtkDes,
        cooldown: character.summonCdFlb || character.summonCd,
        duration: character.summonEffectDurFlb || character.summonEffectDur
      },

      effectFLB: {
        name: character.eidolonEffect,
        description: character.eidolonEffectDesFlb || suffixes.map(e => character[`eidolonEffectDes${e}`])
      },

      subEffectFLB: {
        name: character.eidolonSubEffectFlb || character.eidolonSubEffect,
        description: character.eidolonSubEffectDesFlb
          || character.eidolonSubEffectDes
          || suffixes.map(e => character[`eidolonSubEffectDes${e}`])
      },

      obtainedFrom: character.obtained,
      harem: res.harem2Resource2
    } as IKamihimeFandomFormatted;
  }
}
