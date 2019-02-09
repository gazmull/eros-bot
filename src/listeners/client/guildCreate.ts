import { AkairoClient, Listener } from 'discord-akairo';
import { Guild } from 'discord.js';
import { defaultPrefix } from '../../../auth';
import ErosClient from '../../struct/ErosClient';
import { error, status } from '../../util/console';

export default class extends Listener {
  constructor () {
    super('guildCreate', {
      emitter: 'client',
      event: 'guildCreate'
    });
  }

  public async exec (guild: Guild) {
    const guildSize = guild.client.guilds.size;

    try {
      const twitterChannel = guild.channels.find(c => /twitter/ig.test(c.name));
      const nsfwChannel = guild.channels.find(c => /nsfw/ig.test(c.name));
      const nsfwRole = guild.roles.find(r => /nsfw/ig.test(r.name));
      const client = this.client as ErosClient;

      await client.db.Guild.create({
        id: guild.id,
        loli: false,
        name: guild.name,
        nsfwChannelID: nsfwChannel ? nsfwChannel.id : null,
        nsfwRoleID: nsfwChannel ? nsfwChannel.id : null,
        owner: guild.owner.id,
        prefix: defaultPrefix,
        twitterChannelID: twitterChannel ? twitterChannel.id : null
      });

      const welcomeMessage = [ `Hello, ${guild.owner.user.username}. I joined your server, ${guild.name}.` ];

      if (nsfwChannel)
        welcomeMessage.push([
          `I have detected that you have an NSFW channel (${nsfwChannel.name})`,
          'and I have set it as the NSFW Channel for your guild settings in my database.',
        ].join(' '));
      if (nsfwRole)
        welcomeMessage.push([
          nsfwChannel ? 'Also, ' : '',
          `I have detected that you have an NSFW Role (${nsfwRole.name})`,
          'and I have set it as the NSFW Role for your guild settings in my database.',
        ].join(' '));
      if (twitterChannel)
        welcomeMessage.push([
          nsfwChannel && nsfwRole
            ? 'Finally, '
            : (!nsfwChannel && nsfwRole) || (nsfwChannel && !nsfwRole)
              ? 'Also, '
              : '',
          `I have detected that you have a Twitter channel (${twitterChannel.name})`,
          'and I have set it as the Twitter channel (Kamihime Project Updates) for your guild settings in my database.',
        ].join(' '));
      if (welcomeMessage.length > 1) {
        welcomeMessage.push(
          `\nTo start configuring your guild's settings, see \`${defaultPrefix}help\` in your guild.`,
          '\tExamples:',
          nsfwChannel ? `\t\`${defaultPrefix}nsfwchannel <channel mention>\`` : '',
          nsfwRole ? `\t\`${defaultPrefix}nsfwrole <role mention>\`` : '',
          twitterChannel ? `\n\t\`${defaultPrefix}twitterchannel <channel mention>\`` : ''
        );

        guild.owner.send(welcomeMessage.join('\n'));
      }

      status(`${guild.name} (ID: ${guild.id}) created. ${guildSize} total guilds.`);
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError')
        return status(`${guild.name} (ID: ${guild.id}) already exists, joined anyway. ${guildSize} total guilds.`);

      const client = guild.client as AkairoClient;
      const ownerID = client.ownerID as string;

      await guild.owner.send([
        'I left your guild because there was a problem initiating your guild.',
        `If the issue persists, please contact ${guild.client.users.get(ownerID)}`,
        `Error: ${err}`,
      ]);
      guild.leave();

      error(err);
    }
  }
}
