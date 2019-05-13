import { Message } from 'discord.js';
import Command from '../../struct/command';

export default class extends Command {
  constructor () {
    super('countdown-help', {
      description: { content: 'Shows countdown sub-commands\'s guidelines.' },
      ratelimit: 2
    });
  }

  public async exec (message: Message) {
    const prefix = await this.handler.prefix(message);
    const embed = this.client.embed(message)
      .setColor(0xFF00AE)
      .addField('Adding a Countdown', [
        `**Usage**: ${prefix}countdown add <date> <name>`,
        '**Date** Format: [YYYY]-[MM]-[DD]T[HH]:[mm]',
        '**Note**: Date has to be provided in PDT. https://time.is/PDT',
        '**Note**: Naming can also affect the countdown notifications, so be careful when to append `- End`!',
      ])
      .addField('Removing a Countdown', `**Usage**: ${prefix}countdown remove <name>`)
      .addField('Testing a Countdown', [
        `**Usage**: ${prefix}countdown test <date>`,
        'Same date format from adding a countdown.',
      ]);

    return message.util.send(embed);
  }
}
