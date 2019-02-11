import Command from '../../struct/command';
import ErosClient from '../../struct/ErosClient';

export default class extends Command {
  constructor () {
    super('cdchannel', {
      aliases: [ 'cdchannel', 'countdownchannel' ],
      description: {
        content: 'Changes this guild\'s Countdown Channel.',
        usage: '<resolvable channel>',
        examples: [ '#newbie-lib-questions-not-other-js', '312874659902115460', 'countdown' ]
      },
      userPermissions: [ 'MANAGE_GUILD' ],
      channel: 'guild',
      lock: 'user',
      args: [
        {
          id: 'channel',
          type: 'textChannel',
          default: null,
          prompt: {
            start: 'what would you like to set the Countdown Channel to?',
            retry: 'please provide a valid channel resolvable.'
          }
        },
      ]
    });
  }

  public async exec (message: Message, { channel }) {
    const client = this.client as ErosClient;
    const oldChannel = client.guildSettings.get(message.guild.id, 'cdChannelID', null);
    const resolvedChannel = client.channels.get(oldChannel);
    await client.guildSettings.set(message.guild.id, 'cdChannelID', channel.id);

    return message.util.reply(
      `I have changed the Countdown Channel ${
        oldChannel && resolvedChannel ? `from ${resolvedChannel} ` : ''}to ${channel}.`);
  }
}
