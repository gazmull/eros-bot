const Command = require('../../struct/custom/Command');

class SetNSFWChannelCommand extends Command {
  constructor() {
    super('nsfwchannel', {
      aliases: ['nsfwchannel'],
      description: {
        content: 'Changes this guild\'s NSFW Channel.',
        usage: '<resolvable channel>',
        examples: ['#newbie-lib-questions-not-other-js', '312874659902115460', 'nsfw']
      },
      userPermissions: ['MANAGE_GUILD'],
      channel: 'guild',
      args: [
        {
          id: 'channel',
          type: 'textChannel',
          default: null,
          prompt: {
            start: 'what would you like to set the NSFW Channel to?',
            retry: 'please provide a valid channel resolvable.'
          }
        }
      ]
    });
  }

  async exec(message, { channel }) {
    const oldChannel = this.client.guildSettings.get(message.guild.id, 'nsfwChannelID', null);
    const resolvedChannel = this.client.channels.get(oldChannel);
    await this.client.guildSettings.set(message.guild.id, 'nsfwChannelID', channel.id);

    return message.util.reply(
      `I have changed the NSFW Channel ${
        oldChannel && resolvedChannel ? `from ${resolvedChannel} ` : ''}to ${channel}.`);
  }
}

module.exports = SetNSFWChannelCommand;
