const { status, error } = require('../../utils/console');
const { defaultPrefix } = require('../../auth');
const guilds = require('../models/guild');

module.exports = async guild => {
  const guildSize = guild.client.guilds.size;
  try {
    const twitterChannel = guild.channels.find(c => /twitter/ig.test(c.name));
    const nsfwChannel = guild.channels.find(c => /nsfw/ig.test(c.name));
    const nsfwRole = guild.roles.find(r => /nsfw/ig.test(r.name));

    await guilds.create({
      id: guild.id,
      name: guild.name,
      owner: guild.owner.id,
      prefix: defaultPrefix,
      twitterChannelID: twitterChannel ? twitterChannel.id : null,
      nsfwChannelID: nsfwChannel ? nsfwChannel.id : null,
      nsfwRoleID: nsfwChannel ? nsfwChannel.id : null,
      loli: false
    });
    const welcomeMessage = [`Hello, ${guild.owner.user.username}. I joined your server, ${guild.name}.`];
    if (nsfwChannel)
      welcomeMessage.push(
        `I have detected that you have an NSFW channel (${nsfwChannel.name}) and I have set it as the NSFW Channel for your guild settings in my database.`
      );
    if (nsfwRole)
      welcomeMessage.push(
        `${
          nsfwChannel ? 'Also, ' : ''
        }I have detected that you have an NSFW Role (${nsfwRole.name}) and I have set it as the NSFW Role for your guild settings in my database.`
      );
    if (twitterChannel)
      welcomeMessage.push(
        `${
          nsfwChannel && nsfwRole
            ? 'Finally, '
            : (!nsfwChannel && nsfwRole) || (nsfwChannel && !nsfwRole)
              ? 'Also, '
              : ''
        }I have detected that you have a Twitter channel (${twitterChannel.name}) and I have set it as the Twitter channel (Kamihime Project Updates) for your guild settings in my database.`
      );
    if (welcomeMessage.length > 1) {
      welcomeMessage.push(
        `\n\nTo start configuring your guild's settings, see \`${defaultPrefix}help\` in your guild.\t\nExamples:\n` +
        `${nsfwChannel
          ? `\t\`${defaultPrefix}nsfwchannel <channel mention>\``
          : ''}` +
        `${nsfwRole
          ? nsfwChannel
            ? `\n\t\`${defaultPrefix}nsfwrole <role mention>\``
            : `\t\`${defaultPrefix}nsfwrole <role mention>\``
          : ''}` +
        `${nsfwChannel || nsfwRole
          ? twitterChannel
            ? `\n\t\`${defaultPrefix}twitterchannel <channel mention>\``
            : `\t\`${defaultPrefix}twitterchannel <channel mention>\``
          : ''}`
      );
      guild.owner.send(welcomeMessage.join('\n'));
    }
    status(`${guild.name} (ID: ${guild.id}) created. ${guildSize} total guilds.`);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError')
      return status(`${guild.name} (ID: ${guild.id}) already exists, joined anyway. ${guildSize} total guilds.`);
    await guild.owner.send(
      `I left your guild because there was a problem initiating your guild. If the issue persists, please contact ${
        guild.client.users.get(guild.client.ownerID)}`
    );
    guild.leave();
    error(err.stack);
  }
};
