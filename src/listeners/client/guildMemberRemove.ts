import { GuildMember } from 'discord.js';
import ErosListener from '../../struct/listener';

export default class extends ErosListener {
  constructor () {
    super('guildMemberRemove', {
      event: 'guildMemberRemove',
      emitter: 'client'
    });
  }

  public async exec (member: GuildMember) {
    return this.client.db.Level.destroy({ where: {
        user: member.id,
        guild: member.guild.id
      }
    });
  }
}
