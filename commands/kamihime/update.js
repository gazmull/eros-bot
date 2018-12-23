const Command = require('../../struct/custom/Command');
const { get, post } = require('snekfetch');

const { url: { api: apiURL, dashboard: dashboardURL }, apiToken } = require('../../auth');
const { loading } = require('../../auth').emojis;

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
      shouldAwait: true,
      args: [
        {
          id: 'character',
          prompt: { start: 'Whose information would you like to update?' },
          match: 'text'
        }
      ]
    });
  }

  async exec(message, { character }) {
    try {
      await message.util.send(`${loading} Awaiting KamihimeDB's response...`);

      const request = await get(`${apiURL}search?name=${encodeURI(character)}`, { headers: { Accept: 'application/json' } });
      const rows = request.body;

      if (!rows.length) return message.util.edit(`No character name ${character} found.`);
      else if (rows.length === 1) {
        const result = rows.shift();
        const data = await get(`${apiURL}id/${result.id}`, { headers: { Accept: 'application/json' } });

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

    const data = await get(`${apiURL}id/${character.id}`, { headers: { Accept: 'application/json' } });

    await this.triggerDialog(message, data.body);
  }

  async triggerDialog(message, result) {
    try {
      await message.util.edit(`${loading} Preparing...`, { embed: null });
      const data = await post(`${apiURL}session`, { headers: { Accept: 'application/json' } }).send({ token: apiToken, user: message.author.id, id: result.id });
      const session = data.body;

      const embed = this.client.util.embed()
        .setColor(0xFF00AE)
        .setTitle(session.code === 202 ? 'Existing Session' : 'Update Link Created')
        .setDescription([
          `[${result.name}](${dashboardURL}?character=${session.characterId}&id=${session.id}&k=${session.password})`,
          '\nPlease be advised that this link\'s session will expire within 30 minutes or when you submitted an actual data to the webform.'
        ]);

      return message.util.edit({ embed });
    } catch (err) {
      return new this.client.APIError(message.util, err, 1);
    }
  }
}

module.exports = UpdateKamihimeCommand;
