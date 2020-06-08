import { Listener } from 'discord-akairo';
import { Guild } from 'discord.js';

export default class extends Listener {
  constructor () {
    super('guildCreate', {
      emitter: 'client',
      event: 'guildCreate'
    });
  }

  /* eslint-disable max-len */
  public async exec (guild: Guild) {
    const guildSize = guild.client.guilds.cache.size;
    const exists = await this.client.db.Guild.destroy({ where: { id: guild.id } });

    if (exists)
      return this.client.logger.info(`${guild.name} (ID: ${guild.id}) already exists, joined anyway. ${guildSize} total guilds.`);

    const { defaultPrefix, docs } = this.client.config;

    try {
      const cdChannel = guild.channels.cache.find(c => /countdown/ig.test(c.name));
      const cdRole = guild.roles.cache.find(r => /countdown/ig.test(r.name));
      const twitterChannel = guild.channels.cache.find(c => /twitter/ig.test(c.name));
      const nsfwChannel = guild.channels.cache.find(c => /nsfw/ig.test(c.name));
      const nsfwRole = guild.roles.cache.find(r => /nsfw/ig.test(r.name));
      const existing = [ cdChannel, cdRole, twitterChannel, nsfwChannel, nsfwRole ].filter(el => el);

      await this.client.db.Guild.create({
        id: guild.id,
        cdChannel: cdChannel ? cdChannel.id : null,
        cdRole: cdRole ? cdRole.id : null,
        nsfwChannel: nsfwChannel ? nsfwChannel.id : null,
        nsfwRole: nsfwRole ? nsfwRole.id : null,
        owner: guild.ownerID,
        prefix: defaultPrefix,
        twitterChannel: twitterChannel ? twitterChannel.id : null
      });

      if (guild.owner) {
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
          `\n Or refer to \`${defaultPrefix}guide\` (better yet, ${docs}/using-the-bot) which is recommended.`
        );

        if (guild.owner)
          await guild.owner.send(welcomeMessage.join('\n'))
            .catch(() => this.client.logger.warn(`Could not send message to ${guild.name} (ID: ${guild.id})'s owner.`));
      }

      this.client.logger.info(`${guild.name} (ID: ${guild.id}) created. ${guildSize} total guilds.`);
    } catch (err) {
      if (guild.owner)
        await guild.owner.send([
          'I left your guild because there was a problem initiating your guild.',
          `If the issue persists, please contact ${guild.client.users.cache.get(this.client.ownerID as string)}`,
          `Error: ${err}`,
        ])
          .catch(() => this.client.logger.warn(`Could not send message to ${guild.name} (ID: ${guild.id})'s owner.`));
      guild.leave();

      this.client.logger.error(err);
    }
  }
}
