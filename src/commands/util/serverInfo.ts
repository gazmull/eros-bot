import { PrefixSupplier } from 'discord-akairo';
import Command from '../../struct/command/Command';
import ErosClient from '../../struct/ErosClient';

export default class extends Command {
  constructor () {
    super('serverinfo', {
      aliases: [ 'serverinfo', 'sinfo', 'si', 'guildinfo', 'ginfo', 'gi' ],
      description: { content: 'Displays information of this guild.' },
      clientPermissions: [ 'EMBED_LINKS' ],
      channel: 'guild'
    });
  }

  public exec (message: Message) {
    const client = this.client as ErosClient;
    const memberCount = message.guild.memberCount;
    const presenceCount = message.guild.presences.filter(m => m.status !== 'offline').size;
    const filterChannels = channelType => message.guild.channels.filter(c => c.type === channelType).size;
    const getRecord = (guildID, column) => {
      if (column === 'nsfwRoleID') {
        const guild = client.guilds.get(guildID);
        const role = client.guildSettings.get(guildID, column, null);

        return role ? guild.roles.get(role) : 'Not Configured';
      } else if (column === 'nsfwChannelID' || column === 'twitterChannelID') {
        const channel = client.guildSettings.get(guildID, column, null);

        return channel ? client.channels.get(channel) : 'Not Configured';
      }

      return client.guildSettings.get(guildID, column, null);
    };

    const embed = client.util.embed()
      .setColor(0xFF00AE)
      .setTitle(message.guild.name)
      .setDescription(`Created at ${message.guild.createdAt.toUTCString()}`)
      .setThumbnail(message.guild.iconURL() ? message.guild.iconURL() : client.user.displayAvatarURL())
      .setFooter(`Executed by ${message.author.tag}`)
      .setTimestamp(new Date())
      .addField('Online Members', `${presenceCount} / ${memberCount}`, true)
      .addField('Channels',
        `${filterChannels('category')} Category\n${filterChannels('text')} Text\n${filterChannels('voice')} Voice`,
        true
      )
      .addField('Roles Count', message.guild.roles.size, true)
      .addField('Prefix', `\`${(this.handler.prefix as PrefixSupplier)(message)}\``, true)
      .addField('Twitter Channel', getRecord(message.guild.id, 'twitterChannelID'), true)
      .addField('NSFW Channel', getRecord(message.guild.id, 'nsfwChannelID'), true)
      .addField('NSFW Role', getRecord(message.guild.id, 'nsfwRoleID'), true)
      .addField('Loli Restricted?', getRecord(message.guild.id, 'loli') ? 'Yes. :triumph:' : 'No. :sweat_smile:');

    return message.util.send({ embed });
  }
}
