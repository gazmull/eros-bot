const Command = require('../../struct/custom/Command');
const fetch = require('node-fetch');

const { url, apiToken } = require('../../auth');
const { loading } = require('../../auth').emojis;

class ApproveKamihimeCommand extends Command {
  constructor() {
    super('approve', {
      aliases: ['approve', 'app'],
      description: {
        content: 'Approves a character in Harem Database.',
        usage: '<character id>',
        examples: ['k5040', 'k5044']
      },
      ownerOnly: true,
      args: [{ id: 'id' }]
    });
    this.apiURL = url.api;
  }

  async exec(message, { id }) {
    await message.util.send(`${loading} Awaiting KamihimeDB's response...`);

    try {
      const data = await fetch(`${this.apiURL}id/${id}`, { headers: { Accept: 'application/json' } });
      const character = await data.json();

      await message.util.edit(`${loading} Approving...`);
      const request = await fetch(`${this.apiURL}approve`, {
        headers: { Accept: 'application/json' }, method: 'PUT',
        body: JSON.stringify({ token: apiToken, user: message.author.id, id, name: character.name })
      });
      const response = await request.json();

      const embed = this.client.util.embed()
        .setColor(0xFF00AE)
        .setTitle(`Character ${response.approved ? 'Approved' : 'Disapproved'}`)
        .setDescription(
          `${response.name} (${response.id}) has been ${response.approved ? 'approved' : 'disapproved'} from the database.`
        );

      return message.util.edit({ embed });
    } catch (err) {
      return new this.client.APIError(message.util, err, 1);
    }
  }
}

module.exports = ApproveKamihimeCommand;
