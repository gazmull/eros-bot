import { EmbedField, MessageEmbed } from 'discord.js';
import { IKamihimeDB, IKamihimeFandom, IKamihimeFandomFormatted } from '../../../../typings';
import IErosClientOptions from '../../../../typings/auth';
import C from '../../../util/Constants';
import ErosClient from '../../ErosClient';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { emojis }: { emojis: IErosClientOptions['emojis'] } = require('../../../../auth');

export default class Info {
  constructor (client: ErosClient, prefix: string, res: IKamihimeDB, character: IKamihimeFandom) {
    this.client = client;

    this.apiURI = this.client.config.url.api;

    this.fandomURI = this.client.config.url.fandom;

    this.rootURI = this.client.config.url.gallery;

    this.prefix = prefix;

    this.res = res;

    this.character = character;
  }

  public colors = {
    Standard: 0xb4632c,
    Elite: 0xe5e5e5,
    Legendary: 0xffbf50,
    S: 0x8a57ff,
    N: 0x918f8f,
    R: 0xb4632c,
    SR: 0xe5e5e5,
    SSR: 0xffbf50,
    SSRA: 0x8a57ff
  };

  public client: ErosClient;

  public apiURI: string;

  public fandomURI: string;

  public rootURI: string;

  public prefix: string;

  public res: IKamihimeDB;

  public character: IKamihimeFandom;

  public format (
    embed: MessageEmbed,
    template: IKamihimeFandomFormatted,
    includePreset = true
  ) {
    const { prefix } = this;
    const character = template;

    embed
      .setThumbnail(character.thumbnail)
      .setAuthor(character.name, null, character.link);

    if (character.rarity && !new RegExp(`^${emojis['SSR+']}`).test(embed.description))
      embed.description = `${emojis[character.rarity]} ${embed.description}`;

    if (includePreset) {
      if (character.atk && character.hp) {
        const stats: EmbedField = {
          name: 'Maximum Basic Stats',
          value: `**HP: ${character.hp}** | **ATK: ${character.atk}**`,
          inline: false
        };

        if (embed.fields.length) {
          const oldFields = embed.fields;
          const existingStatsIdx = oldFields.findIndex(el => el.name === stats.name);
          let existingStats: EmbedField;

          if (existingStatsIdx >= 0)
            existingStats = oldFields.splice(existingStatsIdx, 1).shift();

          embed.fields = [];
          embed.fields.push(existingStats || stats, ...oldFields);
        } else embed.fields.push(stats);
      }

      if (character.burst)
        embed.addField(
          `:b:: ${character.burst.name}`,
          [
            character.burst.description || 'Description not specified.',
            character.burst.upgradeDescription ? ` ★ ${character.burst.upgradeDescription}` : '',
            character.soulPoints ? ' ★ Element, DMG and Effects are dependent on equipped weapon' : '',
          ]
            .filter(r => r)
        );

      if (character.abilities)
        for (const [ index, ability ] of character.abilities.entries()) {
          if (!ability) continue;

          const emojis = [
            ':one:',
            ':two:',
            ':three:',
            ':four:',
          ];

          if (Array.isArray(ability))
            embed.addFields(
              ability.map((a, i) => {
                const subEmoji = !i ? 'a' : i === 2 ? 'b' : 'c';

                return {
                  name: [
                    `${emojis[index]}:regional_indicator_${subEmoji}:: ${a.name}`,
                    `| __CD__: ${a.cooldown}`,
                    a.duration ? `| __D__: ${a.duration}` : '',
                  ].join(' '),
                  value: a.description
                };
              })
            );
          else
            embed.addField(
              [
                `${emojis[index]}:regional_indicator_a:: ${ability.name}`,
                `| __CD__: ${ability.cooldown}`,
                ability.duration ? `| __D__: ${ability.duration}` : '',
              ].join(' '),
              [ ability.description, ability.upgradeDescription ]
            );
        }

      if (character.assistAbilities)
        for (const assistAbility of character.assistAbilities) {
          if (!assistAbility) continue;

          embed.addField(`:sparkle:: ${assistAbility.name}`,
            [ assistAbility.description, assistAbility.upgrades ? assistAbility.upgrades.join('\n') : '' ],
            true
          );
        }

      if (character.harem)
        embed
          .addField(C.BLANK, C.BLANK)
          .addField('Harem Episodes Available', `To access: \`${prefix}p ${character.name}\``);

      if (character.obtainedFrom)
        embed.setFooter(
          `can be obtained from ${character.obtainedFrom.replace(/(gacha(?=[.\s]+))/i, '$1 |')}${
            character.obtainedFrom.includes('Gacha')
              ? ''
              : [ 'Awaken', 'Main Quest', 'Tutorial', 'Shop', 'Quests', 'Events' ]
                .some(e => character.obtainedFrom.includes(e))
                ? ''
                : ' Event'
          }`
        );
    }

    return embed;
  }

  public simpleCDur (str: string) {
    if (!str) return null;

    const [ num, type ] = str.split(' ') as string[];

    return Number.isNaN(Number(num))
      ? num
      : `${num}${type ? type.charAt(0).toUpperCase() : 'T'}`;
  }

  get itemPortrait () {
    const res = this.res;

    return encodeURI(`${this.rootURI}wiki/portrait/${res.name} Portrait.${res.id.startsWith('w') ? 'jpg' : 'png'}`);
  }

  get itemPreview () {
    const res = this.res;
    const isWeap = res.id.startsWith('w');
    const result = encodeURI(
      `${this.rootURI}wiki/${isWeap ? 'main' : 'close'}/${res.name}${isWeap ? '' : ' Close'}.png`
    );

    this.character.preview = result;

    return result;
  }

  get itemLink () {
    return `${this.fandomURI}${encodeURI(this.character.name)}`;
  }
}
