const Command = require('../../struct/custom/Command');
const fetch = require('node-fetch');

const { url, apiToken } = require('../../auth');
const { loading } = require('../../auth').emojis;

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
      args: [{ id: 'id' }, { id: 'name', match: 'rest' }]
    });
    this.apiURL = url.api;
    this.dashboardURL = url.dashboard;
  }

  async exec(message, { id, name }) {
    await message.util.send(`${loading} Awaiting KamihimeDB's response...`);

    try {
      const request = await fetch(`${this.apiURL}id/${id}`, { headers: { Accept: 'application/json' } });
      const character = await request.json();
      const json = await character.json();

      if (json.error) throw json.error.message;

      if (character) return message.util.edit(`${character.name} (${character.id}) already exists.`);
    } catch (missing) {
      try {
        await message.util.edit(`${loading} Preparing...`);
        const _data = await fetch(`${this.apiURL}add`, {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          },
          method: 'POST',
          body: JSON.stringify({ token: apiToken, user: message.author.id, id, name })
        });
        const add = await _data.json();

        if (add.error) throw add.error.message;

        const data = await fetch(`${this.apiURL}session`, {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          },
          method: 'POST',
          body: JSON.stringify({ token: apiToken, user: message.author.id, id })
        });
        const session = await data.json();

        if (session.error) throw session.error.message;

        const embed = this.client.util.embed()
          .setColor(0xFF00AE)
          .setTitle('Update Link Created')
          .setDescription([
            `[${id}](${this.dashboardURL}?character=${session.characterId}&id=${session.id}&k=${session.password})`,
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
