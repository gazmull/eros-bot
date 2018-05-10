const { Command } = require('discord-akairo');
const { get, post } = require('snekfetch');

const { url, apiToken } = require('../../auth');
const { loading } = require('../../auth').emojis;
const { error } = require('../../utils/console');

class DeleteKamihimeCommand extends Command {
  constructor() {
    super('delete', {
      aliases: ['delete', 'del'],
      description: {
        content: 'Deletes a character in Harem Database.',
        usage: '<character id>',
        examples: ['k5040', 'k5044']
      },
      ownerOnly: true,
      clientPermissions: ['MANAGE_MESSAGES', 'EMBED_LINKS'],
      args: [{ id: 'id' }]
    });
    this.apiURL = url.api;
  }

  async exec(message, { id }) {
    await message.util.send(`${loading} Awaiting KamihimeDB's response...`);

    try {
      const data = await get(`${this.apiURL}id/${id}`);
      const character = data.body;

      await message.util.edit(`${loading} Deleting...`);
      const request = await post(`${this.apiURL}delete`).send({ token: apiToken, user: message.author.tag, id, name: character.khName });
      const response = request.body;

      const embed = this.client.util.embed()
        .setColor(0xFF00AE)
        .setTitle('Character Deleted')
        .setDescription(`${response.name} (${response.id}) has been deleted from the database.`);

      return message.util.edit({ embed });
    } catch (err) {
      return new this.client.APIError(message.util, err, 1);
    }
  }
}

module.exports = DeleteKamihimeCommand;
