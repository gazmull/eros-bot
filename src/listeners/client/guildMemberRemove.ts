import { Listener } from 'discord-akairo';
import { GuildMember } from 'discord.js';
import ErosClient from '../../struct/ErosClient';

export default class extends Listener {
  constructor () {
    super('guildMemberRemove', {
      event: 'guildMemberRemove',
      emitter: 'client'
    });
  }

  public async exec (member: GuildMember) {
    const client = this.client as ErosClient;

    return client.db.Level.destroy({ where: {
        user: member.id,
        guild: member.guild.id
      }
    });
  }
}
