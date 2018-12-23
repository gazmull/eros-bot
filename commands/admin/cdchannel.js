const Command = require('../../struct/custom/Command');

class SetCDChannelCommand extends Command {
  constructor() {
    super('cdchannel', {
      aliases: ['cdchannel', 'countdownchannel'],
      description: {
        content: 'Changes this guild\'s Countdown Channel.',
        usage: '<resolvable channel>',
        examples: ['#newbie-lib-questions-not-other-js', '312874659902115460', 'countdown']
      },
      userPermissions: ['MANAGE_GUILD'],
      channel: 'guild',
      args: [
        {
          id: 'channel',
          type: 'textChannel',
          default: null,
          prompt: {
            start: 'what would you like to set the Countdown Channel to?',
            retry: 'please provide a valid channel resolvable.'
          }
        }
      ]
    });
  }

  async exec(message, { channel }) {
    const oldChannel = this.client.guildSettings.get(message.guild.id, 'cdChannelID', null);
    const resolvedChannel = this.client.channels.get(oldChannel);
    await this.client.guildSettings.set(message.guild.id, 'cdChannelID', channel.id);

    return message.util.reply(
      `I have changed the Countdown Channel ${
        oldChannel && resolvedChannel ? `from ${resolvedChannel} ` : ''}to ${channel}.`);
  }
}

module.exports = SetCDChannelCommand;
