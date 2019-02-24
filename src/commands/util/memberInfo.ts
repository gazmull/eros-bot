import { GuildMember } from 'discord.js';
import ErosCommand from '../../struct/command';

export default class extends ErosCommand {
  constructor () {
    super('memberinfo', {
      aliases: [ 'memberinfo', 'minfo', 'mi', 'userinfo', 'uinfo', 'ui', 'profile', 'kp' ],
      description: {
        content: 'Displays a server member information. No argument will display yours instead.',
        usage: '[member name]',
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

  public exec (message: Message, { member }: { member: GuildMember }) {
    return this.displayInfo(message, member);
  }

  public async displayInfo (message: Message, member: GuildMember) {
    try {
      const fetchedMember = member || await message.guild.members.fetch(member.id);

      if (!fetchedMember) throw new Error('Member cache missing');

      const res = await this.client.db.Level.findOrCreate({
        where: { user: fetchedMember.id, guild: message.guild.id },
        attributes: [ 'title', 'exp' ]
      });

      if (!res[0]) throw new Error('Cannot resolve the member.');

      const [ levelMember ] = res;
      const ranking = await this.client.db.Level.findAll({
        where: { guild: message.guild.id },
        order: [ [ 'exp', 'DESC' ] ],
        attributes: [ 'user' ]
      });
      const titlesMember = await this.client.db.Title.findAll({
        where: { [this.client.db.Sequelize.Op.or]: [ { id: levelMember.title }, { id: levelMember.title + 1 } ] },
        order: [ [ 'id', 'ASC' ] ],
        attributes: [ 'id', 'name', 'threshold' ]
      });
      const nextTitle = titlesMember[1];

      const embed = this.util.embed(message)
        .setTitle(`${fetchedMember.user.tag} | ${this.memberStatus(member)}`)
        .setDescription(`**ID**: ${fetchedMember.id}${
          member.nickname ? `, also known as **\`${member.nickname}\`**` : ''}`
        )
        .setThumbnail(member.user.displayAvatarURL())
        .addField('Level System', [
          `**Current Title**: ${titlesMember[0].name}`,
          `**Next Title**: ${nextTitle ? nextTitle.name : '∞'}`,
          `**Progress**: ${levelMember.exp} / ${nextTitle ? nextTitle.threshold : '∞'}`,
          `**Server Ranking**: ${ranking.findIndex(v => v.user === member.id) + 1} / ${ranking.length}`,
        ])
        .addField('Roles',
          member.roles.map(r => member.roles.array().indexOf(r) % 3 === 0 ? `\n${r}` : `${r}`).join(', ')
        )
        .addField('Creation Date', member.user.createdAt.toUTCString(), true)
        .addField('Join Date (This server)', member.joinedAt.toUTCString(), true);

      if (member.user.presence.activity)
        embed.addField('Activity', this.memberActivity(member));

      return message.util.send(embed);
    } catch (err) { this.emitError(err, message, this); }
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
