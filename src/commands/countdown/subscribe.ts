import ErosCommand from '../../struct/command';

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
    const guild = await this.client.db.Guild.findOne({
      where: { id: message.guild.id },
      attributes: [ 'cdRole', 'cdChannel' ]
    });
    const resolvedChannel = message.guild.channels.get(guild!.cdChannel);
    const roleId = guild!.cdRole;
    const prefix = await this.handler.prefix(message);

    if (!guild || !roleId || !resolvedChannel)
      return message.util.reply(
        'Countdown Role/Channel is not properly configured.' +
        `${message.author.id === message.guild.ownerID
          // tslint:disable-next-line:max-line-length
          ? ` Please configure your Countdown Role/Channel via \`${prefix}set cdchannel\` and/or \`${prefix}set cdrole\``
          : ' Please contact the server owner.'
        }`
      );

    let result: string;

    if (message.member.roles.has(roleId)) {
      await message.member.roles.remove(roleId);

      result = 'unsubscribed';
    } else {
      await message.member.roles.add(roleId);

      result = 'subscribed';
    }

    return message.util.reply(`successfully ${result} to countdown notifications.`);
  }
}
