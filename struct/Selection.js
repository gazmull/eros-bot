class Selection {
  constructor(client) {

    this.client = client;

    this.users = client.util.collection();
  }

  async execute(message, rows) {
    const embed = this.client.util.embed()
      .setColor(0xFF00AE)
      .setTitle('Selection')
      .setFooter('Expires within 30 seconds.')
      .setDescription(
        [
          'Select an item by their designated `number` to continue.',
          'Saying `cancel` or `0` will cancel the command.'
        ]
      )
      .addField('#', rows.map(i => rows.indexOf(i) + 1).join('\n'), true)
      .addField('Name', rows.map(i => i.khName).join('\n'), true);

    await message.util.edit({ embed });
    this.users.set(message.author.id, true);

    let characterIndex = null;

    try {
      const responses = await message.channel.awaitMessages(
        m =>
          m.author.id === message.author.id &&
          (m.content.toLowerCase() === 'cancel' || parseInt(m.content) === 0 ||
          (parseInt(m.content) >= 1 && parseInt(m.content) <= rows.length)), {
          max: 1,
          time: 30 * 1000,
          errors: ['time']
        }
      );

      const response = responses.first();
      if (response.content.toLowerCase() === 'cancel' || parseInt(response.content) === 0) {
        this.users.delete(message.author.id);

        message.util.edit('Selection cancelled.', { embed: null });
      }

      characterIndex = rows[parseInt(response.content) - 1];

      if (message.guild && message.channel.permissionsFor(message.guild.me).has('MANAGE_MESSAGES'))
        response.delete();
    } catch (err) {
      if (err instanceof Error)
        new this.client.APIError(message.util, err, 0);
      else
        message.util.edit('Selection expired.', { embed: null });
    }
    this.users.delete(message.author.id);

    return characterIndex;
  }
}

module.exports = Selection;
