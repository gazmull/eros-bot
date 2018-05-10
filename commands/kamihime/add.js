const { Command } = require('discord-akairo');
const { get, post } = require('snekfetch');

const { url, apiToken } = require('../../auth');
const { loading } = require('../../auth').emojis;
const { error } = require('../../utils/console');

class AddKamihimeCommand extends Command {
  constructor() {
    super('add', {
      aliases: ['add'],
      description: {
        content: 'Adds a character in Harem Database.',
        usage: '<character id>',
        examples: ['k5040', 'k5044']
      },
      ownerOnly: true,
      clientPermissions: ['MANAGE_MESSAGES', 'EMBED_LINKS'],
      args: [{ id: 'id' }]
    });
    this.apiURL = url.api;
    this.dashboardURL = url.dashboard;
  }

  async exec(message, { id }) {
    await message.util.send(`${loading} Awaiting KamihimeDB's response...`);

    try {
      const request = await get(`${this.apiURL}id/${id}`);
      const character = request.body;

      if (character) return message.util.edit(`${character.khName} (${character.khID}) already exists.`);
    } catch (missing) {
      try {
        await message.util.edit(`${loading} Preparing...`);
        await post(`${this.apiURL}add`).send({ token: apiToken, user: message.author.tag, id });
        const data = await post(`${this.apiURL}session`).send({ token: apiToken, user: message.author.tag, id });
        const session = data.body;

        const embed = this.client.util.embed()
          .setColor(0xFF00AE)
          .setTitle('Update Link Created')
          .setDescription([
            `[${id}](${this.dashboardURL}?character=${session.cID}&id=${session.sID}&k=${session.sPW})`,
            '\nPlease be advised that this link\'s session will expire within 30 minutes or when you submitted an actual data to the webform.'
          ]);

        return message.util.edit({ embed });
      } catch (err) {
        return new this.client.APIError(message.util, err, 1);
      }
    }
  }
}

module.exports = AddKamihimeCommand;
