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
    const guild = message.guild;
    const cdRole = this.client.guildSettings.get(guild.id, 'cdRole', null);
    const cdChannel = this.client.guildSettings.get(guild.id, 'cdChannel', null);
    const resolvedChannel = guild.channels.get(cdChannel);
    const prefix = this.handler.prefix(message);

    if (!cdRole || !resolvedChannel)
      return message.util.reply(
        'Countdown Role/Channel is not properly configured.' +
        `${message.author.id === message.guild.ownerID
          ? ` Please configure your Countdown Role/Channel via \`${prefix}cdchannel\` and/or \`${prefix}cdrole\``
          : ' Please contact the server owner.'
        }`
      );

    let result: string;

    if (message.member.roles.has(cdRole)) {
      await message.member.roles.remove(cdRole);

      result = 'unsubscribed';
    } else {
      await message.member.roles.add(cdRole);

      result = 'subscribed';
    }

    return message.util.reply(`successfully ${result} from countdown notifications.`);
  }
}
