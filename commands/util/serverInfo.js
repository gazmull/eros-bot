const { Command } = require('discord-akairo');

class ServerInfoCommand extends Command {
  constructor() {
    super('serverinfo', {
      aliases: ['serverinfo', 'sinfo', 'si', 'guildinfo', 'ginfo', 'gi'],
      description: { content: 'Displays information of this guild.' },
      clientPermissions: ['EMBED_LINKS'],
      channel: 'guild'
    });
  }

  exec(message) {
    const memberCount = message.guild.memberCount;
    const presenceCount = message.guild.presences.filter(m => m.status !== 'offline').size;
    const filterChannels = channelType => message.guild.channels.filter(c => c.type === channelType).size;
    const getRecord = (guildID, column, placeholder) => {
      if (column === 'nsfwRoleID') {
        const guild = this.client.guilds.get(guildID);
        const role = this.client.guildSettings.get(guildID, column, placeholder);

        return role ? guild.roles.get(role) : 'Not Configured';
      } else if (column === 'nsfwChannelID') {
        const channel = this.client.guildSettings.get(guildID, column, placeholder);

        return channel ? this.client.channels.get(channel) : 'Not Configured';
      }

      return this.client.guildSettings.get(guildID, column, placeholder);
    };

    const embed = this.client.util.embed()
      .setColor(0xFF00AE)
      .setTitle(message.guild.name)
      .setDescription(`Created at ${message.guild.createdAt.toUTCString()}`)
      .setThumbnail(message.guild.iconURL() ? message.guild.iconURL() : this.client.user.displayAvatarURL())
      .setFooter(`Executed by ${message.author.tag}`)
      .setTimestamp(new Date())
      .addField('Online Members', `${presenceCount} / ${memberCount}`, true)
      .addField('Channels',
        `${filterChannels('category')} Category\n${filterChannels('text')} Text\n${filterChannels('voice')} Voice`,
        true
      )
      .addField('Roles Count', message.guild.roles.size, true)
      .addField('Prefix', `\`${this.handler.prefix(message)}\``, true)
      .addField('NSFW Channel', getRecord(message.guild.id, 'nsfwChannelID', null), true)
      .addField('NSFW Role', getRecord(message.guild.id, 'nsfwRoleID', null), true)
      .addField('Loli Restricted?', getRecord(message.guild.id, 'loli', null) ? 'Yes. :triumph:' : 'No. :sweat_smile:');

    return message.util.send({ embed });
  }
}

module.exports = ServerInfoCommand;
