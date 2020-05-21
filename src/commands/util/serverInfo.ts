import { Message } from 'discord.js';
import Command from '../../struct/command';

export default class extends Command {
  constructor () {
    super('serverinfo', {
      aliases: [ 'serverinfo', 'sinfo', 'si', 'guildinfo', 'ginfo', 'gi', 'settings' ],
      description: { content: 'Displays information and bot settings of the server.' },
      clientPermissions: [ 'EMBED_LINKS' ],
      channel: 'guild'
    });
  }

  public async exec (message: Message) {
    const factoryChannels = [ 'nsfwChannel', 'twitterChannel', 'cdChannel' ];
    const factoryRoles = [ 'nsfwRole', 'cdRole' ];
    // eslint-disable-next-line max-len
    const filterChannels = (channelType: string) => message.guild.channels.cache.filter(c => c.type === channelType).size;
    const guild = await this.client.db.Guild.findOne({ where: { id: message.guild.id } });
    const getRecord = (column: string) => {
      const value = guild[column];

      if (factoryRoles.includes(column))
        return value ? message.guild.roles.cache.get(value) : 'Not Configured';
      else if (factoryChannels.includes(column))
        return value ? this.client.channels.cache.get(value) : 'Not Configured';

      return value;
    };

    const embed = this.client.embed(message)
      .setTitle(message.guild.name)
      .setDescription(`Created at ${message.guild.createdAt.toUTCString()}`)
      .setThumbnail(message.guild.iconURL() ? message.guild.iconURL() : this.client.user.displayAvatarURL())
      .setTimestamp(new Date())
      .addField('Channels',
        `${filterChannels('category')} Category\n${filterChannels('text')} Text\n${filterChannels('voice')} Voice`,
        true
      )
      .addField('Roles Count', message.guild.roles.cache.size, true)
      .addField('Prefix', `\`${await this.handler.prefix(message)}\``, true)
      .addField('Twitter Channel', getRecord('twitterChannel'))
      .addField('Countdown Channel', getRecord('cdChannel'), true)
      .addField('Countdown Subscriber Role', getRecord('cdRole'), true)
      .addField('NSFW Channel', getRecord('nsfwChannel'), true)
      .addField('NSFW Role', getRecord('nsfwRole'), true)
      .addField('Loli Restricted?', 'Yes. **Always** :triumph:');

    return message.util.send(embed);
  }
}
