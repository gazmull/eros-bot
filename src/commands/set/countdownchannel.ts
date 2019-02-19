import { TextChannel } from 'discord.js';
import ErosCommand from '../../struct/command';

export default class extends ErosCommand {
  constructor () {
    super('set-countdownchannel', {
      description: {
        content: 'Changes this server\'s Countdown Channel.',
        usage: '<channel>',
        examples: [ '#newbie-lib-questions-not-other-js', '312874659902115460', 'countdown' ]
      },
      args: [
        {
          id: 'channel',
          type: 'textChannel',
          default: null,
          prompt: {
            start: 'what would you like to set the Countdown Channel to?',
            retry: 'please provide a valid channel.'
          }
        },
      ]
    });
  }

  public async exec (message: Message, { channel }: { channel: TextChannel }) {
    const oldChannel = this.client.guildSettings.get(message.guild.id, 'cdChannel', null);
    const resolvedChannel = this.client.channels.get(oldChannel);
    await this.client.guildSettings.set(message.guild.id, 'cdChannel', channel.id);

    return message.util.reply(
      `I have changed the Countdown Channel ${
        oldChannel && resolvedChannel ? `from ${resolvedChannel} ` : ''}to ${channel}.`);
  }
}
