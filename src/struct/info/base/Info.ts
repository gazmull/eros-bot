import { MessageEmbed } from 'discord.js';
import { IKamihimeDB, IKamihimeFandom, IKamihimeFandomFormatted } from '../../../../typings';
import ErosClient from '../../ErosClient';

export default class Info {
  constructor (client: ErosClient, prefix: string, res: IKamihimeDB, character: IKamihimeFandom) {
    this.client = client;

    this.apiURI  = this.client.config.url.api;

    this.fandomURI = this.client.config.url.fandom;

    this.rootURI = this.client.config.url.root;

    this.prefix = prefix;

    this.res = res;

    this.character = character;
  }

  public colors = {
    Elite: 0xe5e5e5,
    Legendary: 0xffbf50,
    N: 0x918f8f,
    R: 0xb4632c,
    SR: 0xe5e5e5,
    SSR: 0xffbf50,
    SSRA: 0x8a57ff,
    Standard: 0xb4632c
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

    if (includePreset) {
      if (character.atk && character.hp) {
        const stats = {
          name: 'Maximum Basic Stats',
          value: `**HP: ${character.hp}** | **ATK: ${character.atk}**`
        };

        if (character.atkFBL && character.hpFBL)
          stats.value += `\n★ [Final Break Limit]: **${character.hpFBL}** | **${character.atkFBL}**`;

        if (embed.fields.length) {
          const oldFields = embed.fields;
          embed.fields = [];

          embed.fields.push(stats);

          for (const field of oldFields)
            embed.fields.push(field);
        } else embed.fields.push(stats);
      }

      if (character.burst)
        embed.addField(
          `:b:: ${character.burst.name}`,
          [
            character.burst.description || 'Description not specified.',
            ` ★ ${character.burst.upgradeDescription || 'Upgrade description not specified.'}`,
          ]
        );

      if (character.abilities)
        for (const ability of character.abilities) {
          if (!ability) continue;

          embed.addField(
            [
              `:regional_indicator_a:: ${ability.name}`,
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
            [ assistAbility.description, assistAbility.upgradeDescription ],
            true
          );
        }

      if (character.harem) {
        embed.addBlankField();
        embed.addField('Harem Episodes Available', `To access: \`${prefix}p ${character.name}\``);
      }

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

  get itemPortrait () {
    const res = this.res;

    return encodeURI(`${this.rootURI}img/wiki/portrait/${res.name} Portrait.${res.id.startsWith('w') ? 'jpg' : 'png'}`);
  }

  get itemPreview () {
    const res = this.res;
    const isWeap = res.id.startsWith('w');
    const result = encodeURI(
      `${this.rootURI}img/wiki/${isWeap ? 'main' : 'close'}/${res.name}${isWeap ? '' : ' Close'}.png`
    );

    this.character.preview = result;

    return result;
  }

  get itemLink () {
    return `${this.fandomURI}${encodeURI(this.character.name)}`;
  }
}
