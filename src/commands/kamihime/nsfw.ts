import { PrefixSupplier } from 'discord-akairo';
import ErosCommand from '../../struct/command';
import ErosClient from '../../struct/ErosClient';

export default class extends ErosCommand {
  constructor () {
    super('nsfw', {
      aliases: [ 'nsfw', 'nsfwaccess', 'access' ],
      description: { content: 'Grants you access to marked `NSFW Channel` in this server.' },
      clientPermissions: [ 'MANAGE_ROLES' ],
      channel: 'guild',
      ratelimit: 1
    });
  }

  public async exec (message: Message) {
    const guild = message.guild;
    const client = this.client as ErosClient;
    const nsfwRole = client.guildSettings.get(guild.id, 'nsfwRole', null);
    const nsfwChannel = client.guildSettings.get(guild.id, 'nsfwChannel', null);
    const resolvedChannel = guild.channels.get(nsfwChannel);
    const prefix = (this.handler.prefix as PrefixSupplier)(message);

    if (!nsfwRole || !resolvedChannel)
      return message.reply(
        'NSFW Role/Channel is not properly configured.' +
        `${message.author.id === message.guild.ownerID
          ? ` Please configure your NSFW Role/Channel via \`${prefix}nsfwchannel\` and/or \`${prefix}nsfwrole\``
          : ' Please contact the server owner.'
        }`
      );
    if (message.member.roles.has(nsfwRole)) throw new Error('You already have this role.');

    await message.member.roles.add(nsfwRole);
    await message.react('✅');

    return message.util.edit([
      `${message.member}, granted! Proceed to ${resolvedChannel} when accessing Harem Scenes.`,
      `Say \`${prefix}guide\` for more info.`,
    ]);
  }
}
