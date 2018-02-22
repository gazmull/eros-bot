const { error } = require('../../utils/console');
const { promisify } = require('util');

const { Command } = require('discord-akairo');
const { get } = require('snekfetch');
const parseInfo = require('infobox-parser');

const { loading } = require('../../auth').emojis;
const { wikia, api } = require('../../auth').url;

class InfoCommand extends Command {
  constructor() {
    super('info', {
      aliases: ['info', 'i', 'khinfo', 'khi', 'kh'],
      description: {
        content: 'Looks up for a Kamihime Project Character/Weapon/Accessory at KH-Nutaku Wikia.',
        usage: '<item name>',
        examples: ['eros', 'mars']
      },
      clientPermissions: ['MANAGE_MESSAGES', 'EMBED_LINKS'],
      args: [
        {
          id: 'item',
          type: word => {
            if (!word || word.length < 2) return null;

            return word;
          },
          prompt: {
            start: 'which or whose information would you like to obtain?',
            retry: 'please provide an input with 2 characters and above.'
          }
        }
      ]
    });
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
    this.shouldAwait = true;
    this.wikiaURL = wikia;
    this.apiURL = api;
  }

  async exec(message, { item }) {
    try {
      await message.util.send(`${loading} Awaiting KamihimeDB's response...`);

      const prefix = this.handler.prefix(message);
      const request = await get(`${this.apiURL}search?name=${encodeURI(item)}`);
      const rows = request.body;

      if (!rows.length) return message.util.edit(`No item named ${item} found.`);
      else if (rows.length === 1) {
        const result = rows.shift();
        const data = await get(`${this.apiURL}id/${result.khID}`);

        return await this.triggerDialog(message, result.khName, data.body, prefix);
      }

      await this.awaitSelection(message, rows, prefix);
    } catch (err) {
      if (err.stack)
        error(err.stack);

      return message.util.edit(`I cannot complete the query because:\n\`\`\`x1\n${err.message}\`\`\`Step: KamihimeDB Request`);
    }
  }

  async awaitSelection(message, result, prefix) {
    const embed = this.client.util.embed()
      .setColor(0xFF00AE)
      .setTitle('Menu Selection')
      .setFooter('Expires within 30 seconds.')
      .setDescription(
        [
          'Multiple items match with your query.',
          'Select an item by their designated `number` to continue.',
          'Saying `cancel` or `0` will cancel the command.'
        ]
      )
      .addField('#', result.map(i => result.indexOf(i) + 1).join('\n'), true)
      .addField('Name', result.map(i => i.khName).join('\n'), true);

    await message.util.edit({ embed });
    this.client.awaitingUsers.set(message.author.id, true);

    try {
      const responses = await message.channel.awaitMessages(
        m =>
          m.author.id === message.author.id &&
            (m.content.toLowerCase() === 'cancel' || parseInt(m.content) === 0 ||
            (parseInt(m.content) >= 1 && parseInt(m.content) <= result.length)), {
          max: 1,
          time: 30 * 1000,
          errors: ['time']
        }
      );

      const response = responses.first();
      if (response.content.toLowerCase() === 'cancel' || parseInt(response.content) === 0) {
        this.client.awaitingUsers.delete(message.author.id);

        return message.util.edit('Selection cancelled.', { embed: null });
      }
      const responseIdx = parseInt(response.content) - 1;
      const data = await get(`${this.apiURL}id/${result[responseIdx].khID}`);
      await this.triggerDialog(message, result[responseIdx].khName, data.body, prefix);
      if (message.guild) response.delete();
    } catch (err) {
      if (err.stack) {
        error(err);

        message.util.edit(
          `I cannot complete the query because:\n\`\`\`x1\n${err}\`\`\`Step: Menu Selection`,
          { embed: null }
        );
      }

      message.util.edit('Selection expired.', { embed: null });
    }
    this.client.awaitingUsers.delete(message.author.id);
  }

  async triggerDialog(message, item, dbRes, prefix) {
    try {
      await message.util.edit(`${loading} Awaiting Wikia's response...`, { embed: null });
      const getArticle = promisify(this.client.request.getArticle.bind(this.client.request));
      const getArticleCategories = promisify(this.client.request.getArticleCategories.bind(this.client.request));
      const category = await getArticleCategories(item);
      const rawData = await getArticle(item);
      const sanitisedData = data => {
        if (!data) throw `API returned no item named ${item} found.`;
        const slicedData = data.slice(
          rawData.indexOf('{{'), rawData.indexOf('== ')
        );

        return slicedData
          .replace(/<br(?:| )(?:|\/)>/g, ' ')
          .replace(/(?:\{{2})([^{}].*?)(?:\}{2})/g, '')
          .replace(/(?:\[{2}.*\|)(.*?)(?:\]{2})/g, '$1')
          .replace(/(?:\[{2})([^:]*?)(?:\]{2})/g, '$1')
          .replace(/(?:\[{2}).*?(?:\]{2})/g, '');
      };
      const result = parseInfo(sanitisedData(rawData));
      let embed;

      switch (true) {
      case category.includes('Category:Kamihime'):
        embed = this.kamihimeTemplate(result, dbRes, prefix);
        break;
      case category.includes('Category:Eidolons'):
        embed = this.eidolonTemplate(result, dbRes, prefix);
        break;
      case category.includes('Category:Souls'):
        embed = this.soulTemplate(result, dbRes, prefix);
        break;
      case category.includes('Category:Weapons'):
        embed = this.weaponTemplate(result, dbRes);
        break;
        // case category.includes('Category:Accessories'):
        // 	embed = this.accessoryTemplate(result, dbRes);
        // 	break;
      default: return message.reply('invalid article.');
      }

      return message.util.edit({ embed });
    } catch (err) {
      if (err.stack)
        error(err.stack);

      return message.util.edit(
        `I cannot complete the query because:\n\`\`\`x1\n${err}\`\`\`Step: Wikia Request`,
        { embed: null }
      );
    }
  }

  kamihimeTemplate(result, dbRes, prefix) {
    const hime = {
      name: result.name,
      description: result.description,
      releaseWeapon: result.releaseWeapon || null,
      link: `${this.wikiaURL}${encodeURI(result.name)}`,
      thumbnail: dbRes.khInfo_avatar,
      rarity: result.rarity,
      element: result.element,
      type: result.type,
      atk: result.atkMax,
      hp: result.hpMax,

      burst: result.burstName,

      ability: [
        result.ability1Name
          ? {
            name: result.ability1Name,
            description: result.ability1Desc,
            upgradeDescription: result.ability1PowerupDesc,
            cooldown: result.ability1Cd,
            duration: result.ability1Dur || null
          }
          : null,

        result.ability2Name
          ? {
            name: result.ability2Name,
            description: result.ability2Desc,
            upgradeDescription: result.ability2PowerupDesc,
            cooldown: result.ability2Cd,
            duration: result.ability2Dur || null
          }
          : null,

        result.ability3Name
          ? {
            name: result.ability3Name,
            description: result.ability3Desc,
            upgradeDescription: result.ability3PowerupDesc,
            cooldown: result.ability3Cd,
            duration: result.ability3Dur || null
          }
          : null
      ],

      assistAbility: [
        result.assistName
          ? {
            name: result.assistName,
            description: result.assistDesc
          }
          : null
      ],

      obtained: result.obtained,
      harem: Boolean(dbRes.khHarem_hentai1Resource2 || dbRes.khHarem_hentai2Resource2)
    };
    const embed = this.client.util.embed()
      .setAuthor(hime.name, null, hime.link)
      .setDescription(
        [
          `__**Kamihime**__ | __**${hime.type}**__ | __**${hime.element}**__${
            hime.releaseWeapon
              ? ` | __**[${hime.releaseWeapon}](${this.wikiaURL}${encodeURI(hime.releaseWeapon)} "Weapon Release")**__`
              : ''}`,
          `${hime.description}`
        ]
      )
      .setThumbnail(hime.thumbnail)
      .setColor(hime.rarity === 'SSR+' ? this.colors.SSRA : this.colors[hime.rarity])
      .addField('Burst', hime.burst);

    for (let i = 0; i < 3; i++) {
      if (!hime.ability[i]) continue;
      embed.addField(
        [
          `Ability: ${hime.ability[i].name} | `,
          `CD: ${hime.ability[i].cooldown}`,
          `${hime.ability[i].duration
            ? ` | D: ${hime.ability[i].duration}`
            : ''}`
        ],
        [
          hime.ability[i].description,
          hime.ability[i].upgradeDescription
            ? ` ★ ${hime.ability[i].upgradeDescription}`
            : ''
        ]
      );
    }

    if (hime.assistAbility)
      for (let i = 0; i < 2; i++) {
        if (!hime.assistAbility[i]) continue;
        embed.addField(`Assist: ${hime.assistAbility[i].name}`, hime.assistAbility[i].description);
      }

    if (hime.harem) {
      embed.addBlankField();
      embed.addField('Harem Episodes Available', `To access: \`${prefix}p ${hime.name}\``);
    }

    if (hime.obtained)
      embed.setFooter(
        `can be obtained from ${hime.obtained.replace(/(gacha(?=.+))/i, '$1 |')}${
          hime.obtained.includes('Gacha')
            ? ''
            : ' Event'
        }`
      );

    return embed;
  }

  eidolonTemplate(result, dbRes, prefix) {
    const eidolon = {
      name: result.name,
      description: result.description,
      link: `${this.wikiaURL}${encodeURI(result.name)}`,
      thumbnail: dbRes.khInfo_avatar || null,
      rarity: result.rarity,
      element: result.element,
      atk: result.atkMax,
      hp: result.hpMax,

      summon: {
        name: result.summonAtk,
        description: result.summonAtkDes,
        cooldown: result.summonCd
      },

      effect: {
        name: result.eidolonEffect,
        description: [
          result.eidolonEffectDes0,
          result.eidolonEffectDes1,
          result.eidolonEffectDes2,
          result.eidolonEffectDes3,
          result.eidolonEffectDes4
        ]
      },

      obtained: result.obtained,
      harem: Boolean(dbRes.khHarem_hentai1Resource2)
    };
    const embed = this.client.util.embed()
      .setAuthor(eidolon.name, null, eidolon.link)
      .setDescription(
        [
          `__**Eidolon**__ | __**${eidolon.element}**__`,
          `${eidolon.description}`
        ]
      )
      .setThumbnail(eidolon.thumbnail)
      .setColor(this.colors[eidolon.rarity])
      .addField(
        `Summon: ${eidolon.summon.name} | CD: ${eidolon.summon.cooldown}`,
        eidolon.summon.description
      )
      .addField(
        `Effect: ${eidolon.effect.name}`,
        this.parseStars(eidolon.effect.description).join('\n')
      );

    if (eidolon.harem) {
      embed.addBlankField();
      embed.addField('Harem Episodes Available', `To access: \`${prefix}p ${eidolon.name}\``);
    }

    if (eidolon.obtained)
      embed.setFooter(
        `can be obtained from ${eidolon.obtained.replace(/(gacha(?=.+))/i, '$1 |')}${
          eidolon.obtained.includes('Gacha')
            ? ''
            : ' Event'
        }`
      );

    return embed;
  }

  parseStars(desc) {
    const result = [];
    for (let i = 0; i < desc.length; i++) {
      if (i === 0) {
        result.push(`${'☆'.repeat(4)} | ${desc[i]}`);
        continue;
      }
      result.push(
        `${'★'.repeat(i)}${
          '☆'.repeat(
            i === 1
              ? 3
              : i === 2
                ? 2
                : i === 3
                  ? 1
                  : 0
          )} | ${desc[i]}`
      );
    }

    return result;
  }

  soulTemplate(result, dbRes, prefix) {
    const soul = {
      name: result.name,
      description: result.description,
      link: `${this.wikiaURL}${encodeURI(result.name)}`,
      thumbnail: dbRes.khInfo_avatar,
      tier: result.tier,
      type: result.type,
      masterBonus: result.masterBonus,
      soulPoints: result.soulP || null,
      weapons: [
        result.weapon1 || null,
        result.weapon2 || null
      ],
      souls: result.soul1 || result.soul2
        ? [
          result.soul1 || null,
          result.soul2 || null
        ]
        : [],

      burst: result.burstName,
      burstDesc: result.burstDesc,

      ability: [
        result.ability1Name
          ? {
            name: result.ability1Name,
            description: result.ability1Desc,
            upgradeDescription: result.ability1PowerupDesc,
            cooldown: result.ability1Cd,
            duration: result.ability1Dur || null
          }
          : null,

        result.ability2Name
          ? {
            name: result.ability2Name,
            description: result.ability2Desc,
            upgradeDescription: result.ability2PowerupDesc,
            cooldown: result.ability2Cd,
            duration: result.ability2Dur || null
          }
          : null,

        result.ability3Name
          ? {
            name: result.ability3Name,
            description: result.ability3Desc,
            upgradeDescription: result.ability3PowerupDesc,
            cooldown: result.ability3Cd,
            duration: result.ability3Dur || null
          }
          : null
      ],

      assistAbility: [
        result.assist1Name
          ? {
            name: result.assist1Name,
            description: result.assist1Desc
          }
          : null,
        result.assist2Name
          ? {
            name: result.assist2Name,
            description: result.assist2Desc
          }
          : null
      ],

      harem: Boolean(dbRes.khHarem_hentai1Resource2)
    };
    const embed = this.client.util.embed()
      .setAuthor(soul.name, null, soul.link)
      .setDescription(
        [
          `__**Soul**__ | __**${soul.type}**__ | __**${soul.weapons[0]}${soul.weapons[1] ? ` and ${soul.weapons[1]}` : ''}**__`,
          soul.souls.length
            ? `**Requires: [${
              soul.souls[0]}](${this.wikiaURL}${encodeURI(soul.souls[0])
            }) & [${
              soul.souls[1]}](${this.wikiaURL}${encodeURI(soul.souls[1])
            }) at LV 20**\n__**Master LV Bonus: ${soul.masterBonus}**__\n${soul.description}`
            : `__**Master LV Bonus: ${soul.masterBonus}**__\n${soul.description}`
        ]
      )
      .setThumbnail(soul.thumbnail)
      .setColor(this.colors[soul.tier])
      .addField(`Burst: ${soul.burst}`, soul.burstDesc);

    for (let i = 0; i < 3; i++) {
      if (!soul.ability[i]) continue;
      embed.addField(
        [
          `Ability: ${soul.ability[i].name} | `,
          `CD: ${soul.ability[i].cooldown}`,
          `${soul.ability[i].duration
            ? ` | D: ${soul.ability[i].duration}`
            : ''}`
        ],
        soul.ability[i].description
      );
    }

    for (let i = 0; i < 2; i++) {
      if (!soul.assistAbility[i]) continue;
      embed.addField(`Assist: ${soul.assistAbility[i].name}`, soul.assistAbility[i].description, true);
    }

    if (soul.harem) {
      embed.addBlankField();
      embed.addField('Harem Episodes Available', `To access: \`${prefix}p ${soul.name}\``);
    }

    if (soul.soulPoints)
      embed.setFooter(`Soul Points to unlock: ${soul.soulPoints}`);

    return embed;
  }

  weaponTemplate(result, dbRes) {
    const weapon = {
      name: result.name,
      description: result.description,
      link: `${this.wikiaURL}${encodeURI(result.name)}`,
      thumbnail: dbRes.khInfo_avatar || null,
      rarity: result.rarity,
      type: {
        weapon: result.weaponType,
        skill: result.skillType || null
      },
      element: result.element,
      atk: result.atkMax,
      hp: result.hpMax,
      burst: result.burstDesc || null,
      obtained: result.obtained
    };
    const embed = this.client.util.embed()
      .setAuthor(`${weapon.name}`, null, weapon.link)
      .setDescription(
        [
          `__**Weapon**__ | __**${weapon.type.weapon}**__ | __**${weapon.element}**__`,
          `${weapon.description}`
        ]
      )
      .setThumbnail(weapon.thumbnail)
      .setColor(this.colors[weapon.rarity]);

    if (weapon.type.skill)
      embed.addField('Weapon Skill Type', weapon.type.skill, true);

    if (weapon.burst)
      embed.addField('Weapon Burst', weapon.burst, true);

    if (weapon.obtained)
      embed.setFooter(`can be obtained from ${weapon.obtained}`);

    return embed;
  }

  // accessoryTemplate(result, dbRes, prefix) {
  // 	const embed = this.client.util.embed()
  // 		.setColor(0xFF00AE)
  // 		.setTitle('Accessory Not Available')
  // 		.setDescription('Currently working on it!');

  // 	return embed;
  // }
}

module.exports = InfoCommand;