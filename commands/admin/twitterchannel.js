const Command = require('../../struct/custom/Command');

class SetTwitterChannelCommand extends Command {
  constructor() {
    super('twitterchannel', {
      aliases: ['twitterchannel', 'twitter'],
      description: {
        content: 'Changes this guild\'s Twitter Channel.',
        usage: '<resolvable channel>',
        examples: ['#newbie-lib-questions-not-other-js', '312874659902115460', 'twitter']
      },
      userPermissions: ['MANAGE_GUILD'],
      channel: 'guild',
      args: [
        {
          id: 'channel',
          type: 'textChannel',
          default: null,
          prompt: {
            start: 'what would you like to set the Twitter Channel to?',
            retry: 'please provide a valid channel resolvable.'
          }
        }
      ]
    });
  }

  async exec(message, { channel }) {
    const oldChannel = this.client.guildSettings.get(message.guild.id, 'twitterChannelID', null);
    await this.client.guildSettings.set(message.guild.id, 'twitterChannelID', channel.id);

    return message.util.reply(
      `I have changed the Twitter Channel ${
        oldChannel ? `from ${this.client.channels.get(oldChannel)} ` : ''}to ${channel}.`);
  }
}

module.exports = SetTwitterChannelCommand;
