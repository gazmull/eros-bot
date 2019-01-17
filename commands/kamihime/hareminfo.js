const Command = require('../../struct/custom/Command');
const fetch = require('node-fetch');

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

      const request = await fetch(`${apiURL}search?name=${encodeURI(character)}`, { headers: { Accept: 'application/json' } });
      const rows = (await request.json()).filter(c => !['x', 'w'].includes(c.id.charAt(0)));

      if (!rows.length) return message.util.edit(`No character named ${character} found.`);
      else if (rows.length === 1) {
        const result = rows.shift();
        const data = await fetch(`${apiURL}id/${result.id}`, { headers: { Accept: 'application/json' } });

        return await this.triggerDialog(message, await data.json());
      }

      await this.awaitSelection(message, rows);
    } catch (err) {
      return new this.client.APIError(message.util, err, 1);
    }
  }

  async awaitSelection(message, rows) {
    const character = await this.client.util.selection.execute(message, rows);

    if (!character) return;

    const data = await fetch(`${apiURL}id/${character.id}`, { headers: { Accept: 'application/json' } });

    await this.triggerDialog(message, await data.json());
  }

  async triggerDialog(message, result) {
    try {
      const prefix = this.handler.prefix(message);
      const guild = message.guild;
      const restricted = guild ? this.client.guildSettings.get(guild.id, 'loli', null) : null;

      if (result.loli && restricted)
        throw `This character has loli contents, but loli contents are restricted within this guild.${
          message.author.id === message.guild.ownerID
            ? ` Please configure your Loli Contents Restriction via ${prefix}loli`
            : ' Please contact the guild owner.'
        }`;

      await message.util.edit(`${loading} Preparing...`, { embed: null });
      const harems = [
        {
          title: result.harem1Title || 'Untitled',
          links: [
            result.harem1Resource1
              ? `${playerURL}${result.id}/1/story`
              : null
          ]
        },
        {
          title: result.harem2Title || 'Untitled',
          links: [
            result.harem2Resource1
              ? `${playerURL}${result.id}/2/story`
              : null,
            result.harem2Resource2
              ? `${playerURL}${result.id}/2/scenario`
              : null,
            result.harem2Resource2
              ? `${playerURL}${result.id}/2/legacy`
              : null
          ]
        },
        {
          title: result.harem3Title || 'Untitled',
          links: [
            result.harem3Resource1
              ? `${playerURL}${result.id}/3/story`
              : null,
            result.harem3Resource2
              ? `${playerURL}${result.id}/3/scenario`
              : null,
            result.harem3Resource2
              ? `${playerURL}${result.id}/3/legacy`
              : null
          ]
        }
      ];
      const embed = this.client.util.embed()
        .setColor(0xFF75F1)
        .setAuthor(result.name, null, `${wikia}${encodeURI(result.name)}`)
        .setDescription(
          `${result.loli ? '**Flagged as Loli**' : ''}${
            result.name.toLowerCase() === (this.client.user.username.toLowerCase())
              ? `\n... ${this.rassedMsg[Math.floor(Math.random() * this.rassedMsg.length)]} ${embarassed}`
              : ''}`
        )
        .setThumbnail(await new Info(this.client, null, result, result).itemPortrait);

      for (let i = 1; i <= 3; i++) {
        const ep = harems[i - 1];
        if (i === 1) {
          embed.addField(
            `Episode ${i}: ${ep.title}`,
            ep.links[0] ? `[Story](${ep.links[0]})` : 'N/A',
            false
          );
          continue;
        }
        if (ep.title === 'Untitled' && !ep.links[0] && !ep.links[1]) continue;
        embed.addField(`Episode ${i}: ${ep.title}`,
          [
            ep.links[0] ? `[Story](${ep.links[0]})` : 'N/A',
            ep.links[1] ? `[Scenario](${ep.links[1]})` : 'N/A',
            ep.links[2] ? `[Legacy](${ep.links[2]})` : 'N/A'
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
