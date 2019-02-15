import { PrefixSupplier } from 'discord-akairo';
import ErosCommand from '../../struct/command';
import ErosClient from '../../struct/ErosClient';

export default class extends ErosCommand {
  constructor () {
    super('countdown-subscribe', {
      description: {
        content: 'Lets you subscribe to countdown notifications to this server. Toggle-able command.'
      },
      clientPermissions: [ 'MANAGE_ROLES' ],
      channel: 'guild',
      ratelimit: 1
    });
  }

  public async exec (message: Message) {
    const guild = message.guild;
    const client = this.client as ErosClient;
    const cdRole = client.guildSettings.get(guild.id, 'cdRoleID', null);
    const cdChannel = client.guildSettings.get(guild.id, 'cdChannelID', null);
    const resolvedChannel = guild.channels.get(cdChannel);
    const prefix = (this.handler.prefix as PrefixSupplier)(message);

    if (!cdRole || !resolvedChannel)
      return message.util.reply(
        'Countdown Role/Channel is not properly configured.' +
        `${message.author.id === message.guild.ownerID
          ? ` Please configure your Countdown Role/Channel via \`${prefix}cdchannel\` and/or \`${prefix}cdrole\``
          : ' Please contact the server owner.'
        }`
      );

    if (message.member.roles.has(cdRole)) await message.member.roles.remove(cdRole);
    else await message.member.roles.add(cdRole);

    await message.react('✅');
  }
}
