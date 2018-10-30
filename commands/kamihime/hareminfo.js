const Command = require('../../struct/custom/Command');
const { get } = require('snekfetch');

const { loading, embarassed } = require('../../auth').emojis;
const { player: playerURL, api: apiURL, wikia } = require('../../auth').url;

const Info = require('../../struct/info/base/Info');

class HaremInfoCommand extends Command {
  constructor() {
    super('hareminfo', {
      aliases: ['hareminfo', 'hinfo', 'hi', 'peek', 'p'],
      description: {
        content: 'Sends a list of Harem Episodes of a character.',
        usage: '<character name>',
        examples: ['eros', 'mars']
      },
      shouldAwait: true,
      args: [
        {
          id: 'character',
          match: 'text',
          type: name => {
            if (!name || name.length < 2) return null;

            return name;
          },
          prompt: {
            start: 'whose episodes information would you like to obtain?',
            retry: 'please provide an input with 2 characters and above.'
          }
        }
      ]
    });
    this.rassedMsg = [
      'b-but why m-me?!',
      'I have the b-best scene... right?!',
      'p-pervert!!!',
      'y-you came to see me, or you came to... *c-come* in me?!',
      'we already did this before... s-secretly... didn\'t we?'
    ];
  }

  async exec(message, { character }) {
    try {
      await message.util.send(`${loading} Awaiting KamihimeDB's response...`);

      const request = await get(`${apiURL}search?name=${encodeURI(character)}`);
      const rows = request.body.filter(c => !['x', 'w'].includes(c.khID.charAt(0)));

      if (!rows.length) return message.util.edit(`No character named ${character} found.`);
      else if (rows.length === 1) {
        const result = rows.shift();
        const data = await get(`${apiURL}id/${result.khID}`);

        return await this.triggerDialog(message, data.body);
      }

      await this.awaitSelection(message, rows);
    } catch (err) {
      return new this.client.APIError(message.util, err, 1);
    }
  }

  async awaitSelection(message, rows) {
    const character = await this.client.util.selection.execute(message, rows);

    if (!character) return;

    const data = await get(`${apiURL}id/${character.khID}`);

    await this.triggerDialog(message, data.body);
  }

  async triggerDialog(message, result) {
    try {
      const prefix = this.handler.prefix(message);
      const guild = message.guild;
      const restricted = guild ? this.client.guildSettings.get(guild.id, 'loli', null) : null;

      if (result.khLoli && restricted)
        throw `This character has loli contents, but loli contents are restricted within this guild.${
          message.author.id === message.guild.ownerID
            ? ` Please configure your Loli Contents Restriction via ${prefix}loli`
            : ' Please contact the guild owner.'
        }`;

      await message.util.edit(`${loading} Preparing...`, { embed: null });
      const harems = [
        {
          title: result.khHarem_intro || 'Untitled',
          file: result.khHarem_introFile || null,
          links: [
            result.khHarem_introResource1
              ? `${playerURL}${result.khID}/1/${result.khHarem_introResource1}`
              : null
          ]
        },
        {
          title: result.khHarem_hentai1 || 'Untitled',
          links: [
            result.khHarem_hentai1Resource1
              ? `${playerURL}${result.khID}/2/${result.khHarem_hentai1Resource1}`
              : null,
            result.khHarem_hentai1Resource2
              ? `${playerURL}${result.khID}/2/${result.khHarem_hentai1Resource2}`
              : null
          ]
        },
        {
          title: result.khHarem_hentai2 || 'Untitled',
          links: [
            result.khHarem_hentai2Resource1
              ? `${playerURL}${result.khID}/3/${result.khHarem_hentai2Resource1}`
              : null,
            result.khHarem_hentai2Resource2
              ? `${playerURL}${result.khID}/3/${result.khHarem_hentai2Resource2}`
              : null
          ]
        }
      ];
      const embed = this.client.util.embed()
        .setColor(0xFF75F1)
        .setAuthor(result.khName, null, `${wikia}${encodeURI(result.khName)}`)
        .setDescription(
          `${result.khLoli ? '**Flagged as Loli**' : ''}${
            result.khName.toLowerCase() === (this.client.user.username.toLowerCase())
              ? `\n... ${this.rassedMsg[Math.floor(Math.random() * this.rassedMsg.length)]} ${embarassed}`
              : ''}`
        )
        .setThumbnail(await new Info(this.client, null, result, result).itemPortrait());

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

      const nsfwChannelID = this.client.guildSettings.get(guild.id, 'nsfwChannelID', null);
      const nsfwChannel = guild.channels.get(nsfwChannelID);

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
      return new this.client.APIError(message.util, err, 1);
    }
  }
}

module.exports = HaremInfoCommand;
