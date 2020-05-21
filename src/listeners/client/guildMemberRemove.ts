import { Listener } from 'discord-akairo';
import { GuildMember } from 'discord.js';

export default class extends Listener {
  constructor () {
    super('guildMemberRemove', {
      event: 'guildMemberRemove',
      emitter: 'client'
    });
  }

  public async exec (member: GuildMember) {
    return this.client.db.Level.destroy({
      where: {
        user: member.id,
        guild: member.guild.id
      }
    });
  }
}
