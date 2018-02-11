const { Command } = require('discord-akairo');
const { get } = require('snekfetch');

const { loading } = require('../../auth').emojis;
const { defaultPrefix } = require('../../auth');
const { player, api } = require('../../auth').url;
const { error } = require('../../utils/console');

class HaremInfoCommand extends Command {
  constructor() {
    super('hinfo', {
      aliases: ['hinfo', 'hareminfo', 'hi', 'peek', 'p'],
      description: {
        content: 'Sends a list of Harem Episodes of a character.',
        usage: '<character name>',
        examples: ['eros', 'mars']
      },
      clientPermissions: ['MANAGE_MESSAGES', 'EMBED_LINKS'],
      args: [
        {
          id: 'character',
          match: 'text',
          prompt: {
            start: 'whose episodes information would you like to obtain?',
          }
        }
      ]
    });
    this.apiURL = api;
    this.playerURL = player;
  }

  async exec(message, { character }) {
    let dialog;
    try {
      if(character.length < 2) return message.reply('I will not operate if there are only less than 2 characters input.');
      dialog = await message.channel.send(`${loading} Awaiting KamihimeDB's response...`);

      const request = await get(`${this.apiURL}search?name=${encodeURI(character)}`);
      const rows = request.body;

      if(!rows.length) return dialog.edit(`no character named ${character} found.`);
      else if(rows.length === 1) {
        const result = rows.shift();
        const data = await get(`${this.apiURL}get/${result.khID}`);
        return this.triggerDialog(message, data.body, dialog);
      }

      this.awaitSelection(message, rows, dialog);
    }
    catch (err) {
      if(err.stack)
        error(err.stack);
      return dialog.edit(`I cannot complete the query because:\n\`\`\`x1\n${err.message}\`\`\``);
    }
  }

  async awaitSelection(message, result, dialog) {
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

    await dialog.edit({ embed });
    this.client.awaitingUsers.set(message.author.id, true);

    try {
      const responses = await message.channel.awaitMessages(
        m =>
          m.author.id === message.author.id &&
          ( m.content.toLowerCase() === 'cancel' || parseInt(m.content) === 0 ||
          ( parseInt(m.content) >= 1 && parseInt(m.content) <= result.length) ), {
            max: 1,
            time: 30 * 1000,
            errors: ['time']
          }
      );

      const response = responses.first();
      if(response.content.toLowerCase() === 'cancel' || parseInt(response.content) === 0) {
        this.client.awaitingUsers.delete(message.author.id);
        return dialog.edit('Selection cancelled.', { embed: null });
      }

      const characterIndex = result[parseInt(response.content) - 1];
      const data = await get(`${this.apiURL}get/${characterIndex.khID}`);
      this.triggerDialog(message, data.body, dialog);
      message.guild ? response.delete() : null;
    }
    catch (err) {
      if(err.stack) {
        error(err);
        return dialog.edit(
          `I cannot complete the query because:\n\`\`\`x1\n${err}\`\`\`Step: Menu Selection`,
          { embed: null }
        );
      }
      else return dialog.edit('Selection expired.', { embed: null });
    }
    this.client.awaitingUsers.delete(message.author.id);
  }

  async triggerDialog(message, result, dialog) {
    try {
      await dialog.edit(`${loading} Preparing...`, { embed: null });
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
        .setDescription(result.khLoli ? '**Flagged as Loli**' : '')
        .setThumbnail(`${result.khInfo_avatar}`);
      
      for(let i = 1; i <= 3; i++) {
        let ep = harems[i - 1];
        if(i === 1) {
          embed.addField(`Episode ${i}: ${ep.title}`,
            [
              ep.links[0] ? `[Story](${ep.links[0]})` : 'N/A',
              ep.file ? `\t[Youtube](${ep.file})` : '\tN/A'
            ],
            false
          );
          continue;
        }
        if(ep.title === 'Untitled' && !ep.links[0] && !ep.links[1]) continue;
        embed.addField(`Episode ${i}: ${ep.title}`,
          [
            ep.links[0] ? `[Story](${ep.links[0]})` : 'N/A',
            ep.links[1] ? `[Scenario](${ep.links[1]})` : 'N/A'
          ],
          true
        );
      }

      const channel = message.channel;

      if(!channel.guild)
        return dialog.edit({ embed });

      const guild = message.guild;
      const nsfwChannelID = this.client.guildSettings.get(guild.id, 'nsfwChannelID', null);
      const nsfwChannel = guild.channels.get(nsfwChannelID);
      const prefix = this.handler.prefix(message);

      if(!nsfwChannel)
        throw `NSFW Channel is not configured.${
          message.author.id === guild.ownerID
            ? ` Please configure your NSFW Channel via ${prefix}nsfwchannel`
            : ' Please contact the guild owner.'
          }`;

      if(channel.id === nsfwChannelID)
        return dialog.edit({ embed });

      await nsfwChannel.send({ embed });
      dialog.edit(
        `I have sent my response at ${nsfwChannel}. If you have no access to that channel, say \`${prefix}nsfw\`.`
      );
    }
    catch (err) {
      if(err.stack)
        error(err.stack);
      return dialog.edit(
        `I cannot complete the query because:\n\`\`\`x1\n${err}\`\`\``,
        { embed: null }
      );
    }
  }
}

module.exports = HaremInfoCommand;