const { put } = require('snekfetch');

const { apiToken, url: { api, wikia } } = require('../../../auth');

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

  async itemPortrait() {
    const { res } = this;
    const filename = `File:${encodeURI(res.khName.replace(/ +/g, '_'))}Portrait`;
    const filenameStripped = `File:${encodeURI(res.khName.replace(/ +/g, ''))}Portrait`;
    const filenames = [`${filename}.png`, `${filenameStripped}.png`, `${filename}.jpg`, `${filenameStripped}.jpg`];
    let image;

    for (const possible of filenames) {
      image = await this.client.getImageInfo(possible);

      if (!image) {
        const capitalised = possible.replace(/\.(\w+)$/, w => w.toUpperCase());

        image = await this.client.getImageInfo(capitalised);
      }

      if (image) break;
    }

    if (!image) return null;

    if (res.khInfo_avatar !== image.url)
      await put(`${api}update`).send({
        token: apiToken,
        avatar: image.url,
        id: res.khID,
        name: res.khName,
        user: this.client.user.tag
      });

    return image.url;
  }

  async itemPreview() {
    const { res } = this;
    const filename = `File:${encodeURI(res.khName.replace(/ +/g, '_'))}Close`;
    const filename2 = `File:${encodeURI(res.khName.replace(/ +/g, '_'))}`;
    const filenameStripped = `File:${encodeURI(res.khName.replace(/ +/g, ''))}Close`;
    const filenameStripped2 = `File:${encodeURI(res.khName.replace(/ +/g, ''))}`;
    const filenames = [
      `${filename}.png`,
      `${filename2}.png`,
      `${filenameStripped}.png`,
      `${filenameStripped2}.png`,
      `${filename}.jpg`,
      `${filename2}.jpg`,
      `${filenameStripped}.jpg`,
      `${filenameStripped2}.jpg`
    ];
    let image;

    for (const possible of filenames) {
      image = await this.client.getImageInfo(possible);

      if (!image) {
        const capitalised = possible.replace(/\.(\w+)$/, w => w.toUpperCase());

        image = await this.client.getImageInfo(capitalised);
      }

      if (image) break;
    }

    if (!image) {
      this.character.preview = null;

      return null;
    }

    this.character.preview = image.url;

    return image.url;
  }

  get itemLink() {
    return `${wikia}${encodeURI(this.character.name)}`;
  }
}

module.exports = Info;
