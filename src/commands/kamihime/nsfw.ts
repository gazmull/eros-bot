import { PrefixSupplier } from 'discord-akairo';
import Command from '../../struct/command';
import ErosClient from '../../struct/ErosClient';

export default class extends Command {
  constructor () {
    super('nsfw', {
      aliases: [ 'nsfw', 'nsfwaccess', 'access' ],
      description: { content: 'Grants you access to marked `NSFW Channel` in this guild.' },
      clientPermissions: [ 'MANAGE_ROLES', 'MANAGE_CHANNELS' ],
      channel: 'guild'
    });
  }

  public async exec (message: Message) {
    try {
      const guild = message.guild;
      const client = this.client as ErosClient;
      const nsfwRole = client.guildSettings.get(guild.id, 'nsfwRoleID', null);
      const nsfwChannel = client.guildSettings.get(guild.id, 'nsfwChannelID', null);
      const resolvedChannel = guild.channels.get(nsfwChannel) || null;
      const prefix = (this.handler.prefix as PrefixSupplier)(message);

      if (!nsfwRole || !resolvedChannel)
        return message.reply(
          'NSFW Role/Channel is not properly configured.' +
          `${message.author.id === message.guild.ownerID
            ? ` Please configure your NSFW Role/Channel via \`${prefix}nsfwchannel\` and/or \`${prefix}nsfwrole\``
            : ' Please contact the guild owner.'
          }`
        );
      if (message.member.roles.has(nsfwRole)) throw new Error('You already have this role.');

      const msg = await message.util.reply('requesting...') as Message;
      await message.member.roles.add(nsfwRole);
      message.react('✅');

      return msg.edit([
        `${message.member}, granted! Proceed to ${resolvedChannel} when accessing Harem Scenes.`,
        `Say \`${prefix}guide\` for more info.`,
      ]);
    } catch (err) { this.emitError(err, message, this); }
  }
}
