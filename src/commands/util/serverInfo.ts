import { PrefixSupplier } from 'discord-akairo';
import ErosCommand from '../../struct/command';
import ErosClient from '../../struct/ErosClient';

export default class extends ErosCommand {
  constructor () {
    super('serverinfo', {
      aliases: [ 'serverinfo', 'sinfo', 'si', 'guildinfo', 'ginfo', 'gi' ],
      description: { content: 'Displays information and bot settings of this server.' },
      clientPermissions: [ 'EMBED_LINKS' ],
      channel: 'guild'
    });
  }

  public exec (message: Message) {
    const client = this.client as ErosClient;
    const memberCount = message.guild.memberCount;
    const presenceCount = message.guild.presences.filter(m => m.status !== 'offline').size;
    const factoryChannels = [ 'nsfwChannelID', 'twitterChannelID', 'cdChannelID' ];
    const factoryRoles = [ 'nsfwRoleID', 'cdRoleID' ];
    const filterChannels = (channelType: string) => message.guild.channels.filter(c => c.type === channelType).size;
    const getRecord = (guildID: string, column: string) => {
      if (factoryRoles.includes(column)) {
        const guild = client.guilds.get(guildID);
        const role = client.guildSettings.get(guildID, column, null);

        return role ? guild.roles.get(role) : 'Not Configured';
      } else if (factoryChannels.includes(column)) {
        const channel = client.guildSettings.get(guildID, column, null);

        return channel ? client.channels.get(channel) : 'Not Configured';
      }

      return client.guildSettings.get(guildID, column, null);
    };

    const embed = this.util.embed(message)
      .setTitle(message.guild.name)
      .setDescription(`Created at ${message.guild.createdAt.toUTCString()}`)
      .setThumbnail(message.guild.iconURL() ? message.guild.iconURL() : client.user.displayAvatarURL())
      .setTimestamp(new Date())
      .addField('Online Members', `${presenceCount} / ${memberCount}`, true)
      .addField('Channels',
        `${filterChannels('category')} Category\n${filterChannels('text')} Text\n${filterChannels('voice')} Voice`,
        true
      )
      .addField('Roles Count', message.guild.roles.size, true)
      .addField('Prefix', `\`${(this.handler.prefix as PrefixSupplier)(message)}\``, true)
      .addField('Twitter Channel', getRecord(message.guild.id, 'twitterChannelID'))
      .addField('Countdown Channel', getRecord(message.guild.id, 'cdChannelID'), true)
      .addField('Countdown Subscriber Role', getRecord(message.guild.id, 'cdRoleID'), true)
      .addField('NSFW Channel', getRecord(message.guild.id, 'nsfwChannelID'), true)
      .addField('NSFW Role', getRecord(message.guild.id, 'nsfwRoleID'), true)
      .addField('Loli Restricted?', getRecord(message.guild.id, 'loli') ? 'Yes. :triumph:' : 'No. :sweat_smile:');

    return message.util.send(embed);
  }
}
