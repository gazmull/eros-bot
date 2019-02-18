import { TextChannel } from 'discord.js';
import ErosCommand from '../../struct/command';

export default class extends ErosCommand {
  constructor () {
    super('set-nsfwchannel', {
      description: {
        content: 'Changes this server\'s NSFW Channel.',
        usage: '<channel>',
        examples: [ '#newbie-lib-questions-not-other-js', '312874659902115460', 'nsfw' ]
      },
      args: [
        {
          id: 'channel',
          type: 'textChannel',
          default: null,
          prompt: {
            start: 'what would you like to set the NSFW Channel to?',
            retry: 'please provide a valid channel.'
          }
        },
      ]
    });
  }

  public async exec (message: Message, { channel }: { channel: TextChannel }) {
    const oldChannel = this.client.guildSettings.get(message.guild.id, 'nsfwChannel', null);
    const resolvedChannel = this.client.channels.get(oldChannel);
    await this.client.guildSettings.set(message.guild.id, 'nsfwChannel', channel.id);

    return message.util.reply(
      `I have changed the NSFW Channel ${
        oldChannel && resolvedChannel ? `from ${resolvedChannel} ` : ''}to ${channel}.`);
  }
}
