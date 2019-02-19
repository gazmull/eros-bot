import { Guild } from 'discord.js';
import ErosListener from '../../struct/listener';

export default class extends ErosListener {
  constructor () {
    super('guildCreate', {
      emitter: 'client',
      event: 'guildCreate'
    });
  }

  /* tslint:disable:max-line-length */
  public async exec (guild: Guild) {
    const { defaultPrefix, docs } = this.client.config;
    const guildSize = guild.client.guilds.size;

    try {
      const cdChannel = guild.channels.find(c => /countdown/ig.test(c.name));
      const cdRole = guild.roles.find(r => /countdown/ig.test(r.name));
      const twitterChannel = guild.channels.find(c => /twitter/ig.test(c.name));
      const nsfwChannel = guild.channels.find(c => /nsfw/ig.test(c.name));
      const nsfwRole = guild.roles.find(r => /nsfw/ig.test(r.name));
      const existing = [ cdChannel, cdRole, twitterChannel, nsfwChannel, nsfwRole ].filter(el => el);

      await this.client.db.Guild.create({
        id: guild.id,
        loli: false,
        cdChannel: cdChannel ? cdChannel.id : null,
        cdRole: cdRole ? cdRole.id : null,
        nsfwChannel: nsfwChannel ? nsfwChannel.id : null,
        nsfwRole: nsfwRole ? nsfwRole.id : null,
        owner: guild.owner.id,
        prefix: defaultPrefix,
        twitterChannel: twitterChannel ? twitterChannel.id : null
      });

      const welcomeMessage = [ `Hello, ${guild.owner.user.username}. I joined your server, ${guild.name}.` ];

      if (existing.length)
        welcomeMessage.push([
          'The following has been detected and added to your guild settings:',
          existing.map(el => `- ${el.name}`).join('\n'),
        ].join('\n'));

      welcomeMessage.push(
        `\nTo start configuring your guild's settings, see \`${defaultPrefix}help\` in your guild (please configure your settings there).`,
        '\tExamples:',
        cdChannel ? `\t\`${defaultPrefix}cdchannel <channel>\`` : '',
        cdRole ? `\t\`${defaultPrefix}cdrole <role>\`` : '',
        nsfwChannel ? `\t\`${defaultPrefix}nsfwchannel <channel>\`` : '',
        nsfwRole ? `\t\`${defaultPrefix}nsfwrole <role>\`` : '',
        twitterChannel ? `\n\t\`${defaultPrefix}twitterchannel <channel>\`` : '',
        `\n Or refer to \`${defaultPrefix}guide\` (better yet, ${docs}) which is recommended.`
      );

      guild.owner.send(welcomeMessage.join('\n'));

      this.client.logger.status(`${guild.name} (ID: ${guild.id}) created. ${guildSize} total guilds.`);
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError')
        return this.client.logger.status(`${guild.name} (ID: ${guild.id}) already exists, joined anyway. ${guildSize} total guilds.`);

      await guild.owner.send([
        'I left your guild because there was a problem initiating your guild.',
        `If the issue persists, please contact ${guild.client.users.get(this.client.ownerID)}`,
        `Error: ${err}`,
      ]);
      guild.leave();

      this.client.logger.error(err);
    }
  }
}
