import { Message, TextChannel } from 'discord.js';
import { IKamihimeDB } from '../../../typings';
import Command from '../command';
import ErosClient from '../ErosClient';

export default class {
  constructor (client: ErosClient) {
    this.client = client;
  }

  protected client: ErosClient;

  public async exec (message: Message, command: Command, rows: IKamihimeDB[]) {
    const client = this.client;
    const embed = client.util.embed()
      .setColor(0xFF00AE)
      .setTitle('Selection')
      .setFooter('Expires within 30 seconds.')
      .setDescription(
        [
          'Select an item by their designated `number` to continue.',
          'Saying `cancel` or `0` will cancel the command.',
        ]
      )
      .addField('#', rows.map(i => rows.indexOf(i) + 1).join('\n'), true)
      .addField('Name', rows.map(i => i.name).join('\n'), true);

    await message.util.edit(null, embed);

    let character: IKamihimeDB = null;

    try {
      const channel = message.channel as TextChannel;
      const responses = await channel.awaitMessages(
        m =>
          m.author.id === message.author.id &&
          (m.content.toLowerCase() === 'cancel' || parseInt(m.content) === 0 ||
          (parseInt(m.content) >= 1 && parseInt(m.content) <= rows.length)), {
          errors: [ 'time' ],
          max: 1,
          time: 30 * 1000
        }
      );

      const response = responses.first();
      const index = parseInt(response.content);
      if (response.content.toLowerCase() === 'cancel' || index === 0)
        message.util.edit('Selection cancelled.', { embed: null });

      character = rows[index - 1];

      if (message.guild && channel.permissionsFor(message.guild.me).has('MANAGE_MESSAGES'))
        response.delete();
    } catch (err) {
      // tslint:disable-next-line:no-unused-expression
      if (err instanceof Error) new client.ErosError(message, command, err, 3);
      else message.util.edit('Selection expired.', { embed: null });
    }

    return character;
  }
}
