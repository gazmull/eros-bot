import ErosCommand from '../../struct/command';

export default class extends ErosCommand {
  constructor () {
    super('serverinfo', {
      aliases: [ 'serverinfo', 'sinfo', 'si', 'guildinfo', 'ginfo', 'gi', 'settings' ],
      description: { content: 'Displays information and bot settings of this server.' },
      clientPermissions: [ 'EMBED_LINKS' ],
      channel: 'guild'
    });
  }

  public exec (message: Message) {
    const memberCount = message.guild.memberCount;
    const presenceCount = message.guild.presences.filter(m => m.status !== 'offline').size;
    const factoryChannels = [ 'nsfwChannel', 'twitterChannel', 'cdChannel' ];
    const factoryRoles = [ 'nsfwRole', 'cdRole' ];
    const filterChannels = (channelType: string) => message.guild.channels.filter(c => c.type === channelType).size;
    const getRecord = (guildID: string, column: string) => {
      if (factoryRoles.includes(column)) {
        const guild = this.client.guilds.get(guildID);
        const role = this.client.guildSettings.get(guildID, column, null);

        return role ? guild.roles.get(role) : 'Not Configured';
      } else if (factoryChannels.includes(column)) {
        const channel = this.client.guildSettings.get(guildID, column, null);

        return channel ? this.client.channels.get(channel) : 'Not Configured';
      }

      return this.client.guildSettings.get(guildID, column, null);
    };

    const embed = this.util.embed(message)
      .setTitle(message.guild.name)
      .setDescription(`Created at ${message.guild.createdAt.toUTCString()}`)
      .setThumbnail(message.guild.iconURL() ? message.guild.iconURL() : this.client.user.displayAvatarURL())
      .setTimestamp(new Date())
      .addField('Online Members', `${presenceCount} / ${memberCount}`, true)
      .addField('Channels',
        `${filterChannels('category')} Category\n${filterChannels('text')} Text\n${filterChannels('voice')} Voice`,
        true
      )
      .addField('Roles Count', message.guild.roles.size, true)
      .addField('Prefix', `\`${this.handler.prefix(message)}\``, true)
      .addField('Twitter Channel', getRecord(message.guild.id, 'twitterChannel'))
      .addField('Countdown Channel', getRecord(message.guild.id, 'cdChannel'), true)
      .addField('Countdown Subscriber Role', getRecord(message.guild.id, 'cdRole'), true)
      .addField('NSFW Channel', getRecord(message.guild.id, 'nsfwChannel'), true)
      .addField('NSFW Role', getRecord(message.guild.id, 'nsfwRole'), true)
      .addField('Loli Restricted?', getRecord(message.guild.id, 'loli') ? 'Yes. :triumph:' : 'No. :sweat_smile:');

    return message.util.send(embed);
  }
}
