import { GuildMember, Message } from 'discord.js';
import Command from '../../struct/command';

export default class extends Command {
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
    const fetchedMember = member || await message.guild.members.fetch(member.id);

    if (!fetchedMember) throw new Error('Member cache missing');

    const [ levelMember ] = await this.client.db.Level.findOrCreate(
      { where: { user: fetchedMember.id, guild: message.guild.id } }
    );

    const ranking = await this.client.db.Level.findAll({
      where: { guild: message.guild.id },
      order: [ [ 'exp', 'DESC' ] ],
      attributes: [ 'user' ]
    });
    const titlesMember = await this.client.db.Title.findAll({
      where: { [this.client.db.Op.or]: [ { id: levelMember.title }, { id: levelMember.title + 1 } ] },
      order: [ [ 'id', 'ASC' ] ],
      attributes: [ 'id', 'name', 'threshold' ]
    });
    const nextTitle = titlesMember[1];

    const embed = this.client.embed(message)
      .setTitle(`${fetchedMember.user.tag}`)
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
        member.roles.cache.map(r => r).join(', ')
      )
      .addField('Creation Date', member.user.createdAt.toUTCString(), true)
      .addField('Join Date (This server)', member.joinedAt.toUTCString(), true);

    return message.util.send(embed);
  }
}
