const { Command } = require('discord-akairo');
const { get, post } = require('snekfetch');

const { url, apiToken } = require('../../auth');
const { loading } = require('../../auth').emojis;
const { error } = require('../../utils/console');

class UpdateKamihimeCommand extends Command {
  constructor() {
    super('update', {
      aliases: ['update', 'upd'],
      description: {
        content: 'Updates a character in Harem Database.',
        usage: '<character name>',
        examples: ['eros', 'mars']
      },
      ownerOnly: true,
      clientPermissions: ['MANAGE_MESSAGES', 'EMBED_LINKS'],
      args: [
        {
          id: 'character',
          prompt: { start: 'Whose information would you like to update?' }
        }
      ]
    });
    this.shouldAwait = true;
    this.apiURL = url.api;
    this.dashboardURL = url.dashboard;
  }

  async exec(message, { character }) {
    try {
      await message.util.send(`${loading} Awaiting KamihimeDB's response...`);

      const request = await get(`${this.apiURL}search?name=${encodeURI(character)}`);
      const rows = request.body;

      if (!rows.length) return message.util.edit(`No character name ${character} found.`);
      else if (rows.length === 1) {
        const result = rows.shift();
        const data = await get(`${this.apiURL}id/${result.khID}`);

        return await this.triggerDialog(message, data.body);
      }

      await this.awaitSelection(message, rows);
    } catch (err) {
      return new this.client.APIError(message.util, err, 1);
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
      if (err.stack)
        new this.client.APIError(message.util, err, 0);
      else
        message.util.edit('Selection expired.', { embed: null });
    }
    this.client.awaitingUsers.delete(message.author.id);
  }

  async triggerDialog(message, result) {
    try {
      await message.util.edit(`${loading} Preparing...`, { embed: null });
      const data = await post(`${this.apiURL}session`).send({ token: apiToken, user: message.author.tag, id: result.khID });
      const session = data.body;

      const embed = this.client.util.embed()
        .setColor(0xFF00AE)
        .setTitle(session.code === 202 ? 'Existing Session' : 'Update Link Created')
        .setDescription([
          `[${result.khName}](${this.dashboardURL}?character=${session.cID}&id=${session.sID}&k=${session.sPW})`,
          '\nPlease be advised that this link\'s session will expire within 30 minutes or when you submitted an actual data to the webform.'
        ]);

      return message.util.edit({ embed });
    } catch (err) {
      return new this.client.APIError(message.util, err, 1);
    }
  }
}

module.exports = UpdateKamihimeCommand;
