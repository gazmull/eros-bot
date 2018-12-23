const { url: { api, wikia, root: rootURL } } = require('../../../auth');

class Info {
  constructor(client, prefix, res, character) {
    this.colors = {
      Legendary: 0xffbf50,
      Elite: 0xe5e5e5,
      Standard: 0xb4632c,
      SSRA: 0x8a57ff,
      SSR: 0xffbf50,
      SR: 0xe5e5e5,
      R: 0xb4632c,
      N: 0x918f8f
    };

    this.apiURI = api;

    this.wikiaURI = wikia;

    this.client = client;

    this.prefix = prefix;

    this.res = res;

    this.character = character;
  }

  format(embed, template) {
    const { prefix } = this;
    const character = template;

    embed
      .setThumbnail(character.thumbnail)
      .setAuthor(character.name, null, character.link);

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
          ` ★ ${character.burst.upgradeDescription || 'Upgrade description not specified.'}`
        ]
      );

    if (character.abilities)
      for (let i = 0; i < character.abilities.length; i++) {
        if (!character.abilities[i]) continue;

        embed.addField(
          [
            `:regional_indicator_a:: ${character.abilities[i].name}`,
            `| __CD__: ${character.abilities[i].cooldown}`,
            `${character.abilities[i].duration
              ? `| __D__: ${character.abilities[i].duration}`
              : ''}`
          ].join(' '),
          [
            character.abilities[i].description,
            character.abilities[i].upgradeDescription
          ]
        );
      }

    if (character.assistAbilities)
      for (let i = 0; i < character.assistAbilities.length; i++) {
        if (!character.assistAbilities[i]) continue;

        embed.addField(`:sparkle:: ${character.assistAbilities[i].name}`,
          [
            character.assistAbilities[i].description,
            character.assistAbilities[i].upgradeDescription
          ],
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
            : ['Awaken', 'Main Quest', 'Tutorial', 'Shop', 'Quests', 'Events'].some(e => character.obtainedFrom.includes(e))
              ? ''
              : ' Event'
        }`
      );

    return embed;
  }

  get itemPortrait() {
    const res = this.res;

    return encodeURI(`${rootURL}wiki/img/portrait/${res.name} Portrait.${res.id.startsWith('w') ? 'jpg' : 'png'}`);
  }

  get itemPreview() {
    const res = this.res;
    const isWeap = res.id.startsWith('w');

    return encodeURI(`${rootURL}wiki/img/${isWeap ? 'main' : 'close'}/${res.name}${isWeap ? '' : ' Close'}.png`);
  }

  get itemLink() {
    return `${wikia}${encodeURI(this.character.name)}`;
  }
}

module.exports = Info;
