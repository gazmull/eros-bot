const { Command } = require('discord-akairo');
const { get } = require('snekfetch');

const { loading, embarassed } = require('../../auth').emojis;
const { player, api } = require('../../auth').url;
const { error } = require('../../utils/console');

class HaremInfoCommand extends Command {
  constructor() {
    super('hinfo', {
      aliases: ['hareminfo', 'hinfo', 'hi', 'peek', 'p'],
      description: {
        content: 'Sends a list of Harem Episodes of a character.',
        usage: '<character name>',
        examples: ['eros', 'mars']
      },
      clientPermissions: ['MANAGE_MESSAGES', 'EMBED_LINKS'],
      args: [
        {
          id: 'character',
          type: word => {
            if (!word || word.length < 2) return null;

            return word;
          },
          prompt: {
            start: 'whose episodes information would you like to obtain?',
            retry: 'please provide an input with 2 characters and above.'
          }
        }
      ]
    });
    this.shouldAwait = true;
    this.apiURL = api;
    this.playerURL = player;
    this.rassedMsg = [
      'b-but why m-me?!',
      'I have the b-best scene... right?!',
      'p-pervert!!!',
      'y-you came to see me, or you came to... *c-come* on me?!',
      'we already did this before... s-secretly... didn\'t we?'
    ];
  }

  async exec(message, { character }) {
    try {
      await message.util.send(`${loading} Awaiting KamihimeDB's response...`);

      const request = await get(`${this.apiURL}search?name=${encodeURI(character)}`);
      const rows = request.body;

      if (!rows.length) return message.util.edit(`No character named ${character} found.`);
      else if (rows.length === 1) {
        const result = rows.shift();
        const data = await get(`${this.apiURL}id/${result.khID}`);

        return await this.triggerDialog(message, data.body);
      }

      await this.awaitSelection(message, rows);
    } catch (err) {
      if (err.stack)
        error(err.stack);

      return message.util.edit(`I cannot complete the query because:\n\`\`\`x1\n${err.message}\`\`\``);
    }
  }

  async awaitSelection(message, result) {
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

      const characterIndex = result[parseInt(response.content) - 1];
      const data = await get(`${this.apiURL}id/${characterIndex.khID}`);
      await this.triggerDialog(message, data.body);
      if (message.guild) response.delete();
    } catch (err) {
      if (err.stack) {
        error(err);

        return message.util.edit(
          `I cannot complete the query because:\n\`\`\`x1\n${err}\`\`\`Step: Menu Selection`,
          { embed: null }
        );
      }
      message.util.edit('Selection expired.', { embed: null });
    }
    this.client.awaitingUsers.delete(message.author.id);
  }

  async triggerDialog(message, result) {
    try {
      await message.util.edit(`${loading} Preparing...`, { embed: null });
      const harems = [
        {
          title: result.khHarem_intro || 'Untitled',
          file: result.khHarem_introFile || null,
          links: [
            result.khHarem_introResource1
              ? `${this.playerURL}${result.khID}/1/${result.khHarem_introResource1}`
              : null
          ]
        },
        {
          title: result.khHarem_hentai1 || 'Untitled',
          links: [
            result.khHarem_hentai1Resource1
              ? `${this.playerURL}${result.khID}/2/${result.khHarem_hentai1Resource1}`
              : null,
            result.khHarem_hentai1Resource2
              ? `${this.playerURL}${result.khID}/2/${result.khHarem_hentai1Resource2}`
              : null
          ]
        },
        {
          title: result.khHarem_hentai2 || 'Untitled',
          links: [
            result.khHarem_hentai2Resource1
              ? `${this.playerURL}${result.khID}/3/${result.khHarem_hentai2Resource1}`
              : null,
            result.khHarem_hentai2Resource2
              ? `${this.playerURL}${result.khID}/3/${result.khHarem_hentai2Resource2}`
              : null
          ]
        }
      ];
      const embed = this.client.util.embed()
        .setColor(0xFF75F1)
        .setTitle(result.khName)
        .setDescription(
          `${result.khLoli ? '**Flagged as Loli**' : ''}${
            result.khName.toLowerCase().includes(this.client.user.username.toLowerCase())
              ? `\n... ${this.rassedMsg[Math.floor(Math.random() * this.rassedMsg.length)]} ${embarassed}`
              : ''}`
        )
        .setThumbnail(`${result.khInfo_avatar}`);

      for (let i = 1; i <= 3; i++) {
        const ep = harems[i - 1];
        if (i === 1) {
          embed.addField(`Episode ${i}: ${ep.title}`,
            [
              ep.links[0] ? `[Story](${ep.links[0]})` : 'N/A',
              ep.file ? `\t[Youtube](${ep.file})` : '\tN/A'
            ],
            false
          );
          continue;
        }
        if (ep.title === 'Untitled' && !ep.links[0] && !ep.links[1]) continue;
        embed.addField(`Episode ${i}: ${ep.title}`,
          [
            ep.links[0] ? `[Story](${ep.links[0]})` : 'N/A',
            ep.links[1] ? `[Scenario](${ep.links[1]})` : 'N/A'
          ],
          true
        );
      }

      const channel = message.channel;

      if (!channel.guild)
        return message.util.edit({ embed });

      const guild = message.guild;
      const nsfwChannelID = this.client.guildSettings.get(guild.id, 'nsfwChannelID', null);
      const nsfwChannel = guild.channels.get(nsfwChannelID);
      const prefix = this.handler.prefix(message);

      if (!nsfwChannel)
        throw `NSFW Channel is not configured.${
          message.author.id === guild.ownerID
            ? ` Please configure your NSFW Channel via ${prefix}nsfwchannel`
            : ' Please contact the guild owner.'
        }`;

      if (channel.id === nsfwChannelID)
        return message.util.edit({ embed });

      await nsfwChannel.send({ embed });

      return message.util.edit(
        `I have sent my response at ${nsfwChannel}. If you have no access to that channel, say \`${prefix}nsfw\`.`
      );
    } catch (err) {
      if (err.stack)
        error(err.stack);

      return message.util.edit(
        `I cannot complete the query because:\n\`\`\`x1\n${err}\`\`\``,
        { embed: null }
      );
    }
  }
}

module.exports = HaremInfoCommand;