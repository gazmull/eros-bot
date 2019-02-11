import { GuildMember } from 'discord.js';
import Command from '../../struct/command';

export default class extends Command {
  constructor () {
    super('memberinfo', {
      aliases: [ 'memberinfo', 'minfo', 'mi', 'userinfo', 'uinfo', 'ui' ],
      description: {
        content: 'Displays a guild member information. No arguments will display yours instead.',
        usage: '<optional member resolvable>',
        examples: [ 'A Binary Large OBject', 'Euni', 'Euni#0011', '319102712383799296' ]
      },
      clientPermissions: [ 'EMBED_LINKS' ],
      channel: 'guild',
      args: [
        {
          id: 'member',
          type: 'member',
          default: (message: Message) => message.member
        },
      ]
    });
  }

  public exec (message: Message, { member }) {
    return this.displayInfo(message, member);
  }

  public async displayInfo (message: Message, member: GuildMember) {
    try {
      const fetchedMember = member || await message.guild.members.fetch(member.id);
      if (!fetchedMember) throw new Error('Member cache missing');

      const embed = this.util.embed(message)
        .setTitle(`${fetchedMember.user.tag} | ${this.memberStatus(member)}`)
        .setDescription(`**ID**: ${fetchedMember.id}${
          member.nickname ? `, also known as **\`${member.nickname}\`**` : ''}`
        )
        .setThumbnail(member.user.displayAvatarURL())
        .addField('Roles',
          member.roles.map(r => member.roles.array().indexOf(r) % 3 === 0 ? `\n${r}` : `${r}`).join(', ')
        )
        .addField('Creation Date', member.user.createdAt.toUTCString(), true)
        .addField('Join Date (This guild)', member.joinedAt.toUTCString(), true);

      if (member.user.presence.activity)
        embed.addField('Activity', this.memberActivity(member));

      return message.util.send({ embed });
    } catch (err) { this.emitError(err, message, this, 0); }
  }

  public memberStatus (member: GuildMember) {
    const status = member.user.presence.status;

    switch (status) {
      default: return 'Online';
      case 'idle': return 'Idle';
      case 'dnd': return 'Do Not Disturb';
      case 'offline': return 'Offline';
    }
  }

  public memberActivity (member: GuildMember) {
    const activity = member.user.presence.activity;

    switch (activity.type) {
      default: return `Playing **${activity.name}**`;
      case 'STREAMING': return `Streaming **${activity.name}**`;
      case 'WATCHING': return `Watching **${activity.name}**`;
      case 'LISTENING': return `Listening to **${activity.name}**`;
    }
  }
}
