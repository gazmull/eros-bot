import ErosCommand from '../../struct/command';

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
    const guild = await this.client.db.Guild.findOne({
      where: { id: message.guild.id },
      attributes: [ 'nsfwRole', 'nsfwChannel' ]
    });
    const resolvedChannel = message.guild.channels.get(guild!.nsfwChannel);
    const prefix = await this.handler.prefix(message);

    if (!guild!.nsfwRole || !resolvedChannel)
      return message.util.reply(
        'NSFW Role/Channel is not properly configured.' +
        `${message.author.id === message.guild.ownerID
          ? ` Please configure your NSFW Role/Channel via \`${prefix}set nsfwchannel\` and/or \`${prefix}set nsfwrole\``
          : ' Please contact the server owner.'
        }`
      );
    if (message.member.roles.has(guild.nsfwRole)) return message.util.reply('you already have this role.');

    await message.member.roles.add(guild.nsfwRole);
    await message.react('✅');

    return message.util.reply([
      `granted! Proceed to ${resolvedChannel} when accessing Harem Scenes.`,
      `Say \`${prefix}guide 20\` for more info.`,
    ]);
  }
}
