import { Message } from 'discord.js';
import Command from '../../struct/command';

export default class extends Command {
  constructor () {
    super('invite', {
      aliases: [ 'invite', 'addbot', 'inviteme', 'donate' ],
      description: { content: 'Displays my invite link and my author\'s tag to contact.' }
    });
  }

  public async exec (message: Message) {
    const { docs, inviteLink, supportLink } = this.client.config;
    const owner = await this.client.users.fetch(this.client.ownerID as string);
    const embed = this.client.embed(message)
      .setThumbnail(this.client.user.displayAvatarURL())
      .setDescription([
        `Documentation: ${docs}`,
        `Invite link: ${inviteLink}`,
        `Bot Author: ${owner}`,
        `Discord Link: ${supportLink}`,
      ])
      .addField('Donate: Keep Eros Alive For Everyone!', [
        'While Eros is free of use and is 24/7 online, the author needs help to keep her alive for everyone!',
        '',
        'Donating will give you benefits to the following:',
        `- Donor role + Donors Only channel at [Eros' Laboratory](${supportLink})`,
        '- Unlimited episodes viewing at [Kamihime Database](https://kamihimedb.thegzm.space)',
        '- Continuous maintenance and improvements to the bot',
        '- More to come™',
        '',
        '*This only applies after [KamihimeDB v3](https://github.com/gazmull/kamihime-database/pull/15) get released*',
        '',
        `If you want to receive your role, please make sure you are in [Eros' Laboratory](${supportLink}).`,
        `[***Donate Here***](https://donatebot.io/checkout/545588880129130496?buyer=${message.author.id})`,
      ]);

    return message.util.send(embed);
  }
}
