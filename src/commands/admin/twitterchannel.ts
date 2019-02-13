import { TextChannel } from 'discord.js';
import Command from '../../struct/command';
import ErosClient from '../../struct/ErosClient';

export default class extends Command {
  constructor () {
    super('twitterchannel', {
      aliases: [ 'twitterchannel', 'twitter' ],
      description: {
        content: 'Changes this guild\'s Twitter Channel.',
        usage: '<resolvable channel>',
        examples: [ '#newbie-lib-questions-not-other-js', '312874659902115460', 'twitter' ]
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
            start: 'what would you like to set the Twitter Channel to?',
            retry: 'please provide a valid channel resolvable.'
          }
        },
      ]
    });
  }

  public async exec (message: Message, { channel }: { channel: TextChannel }) {
    const client = this.client as ErosClient;
    const oldChannel = client.guildSettings.get(message.guild.id, 'twitterChannelID', null);
    const resolvedChannel = client.channels.get(oldChannel);
    await client.guildSettings.set(message.guild.id, 'twitterChannelID', channel.id);

    return message.util.reply(
      `I have changed the Twitter Channel ${
        oldChannel && resolvedChannel ? `from ${resolvedChannel} ` : ''}to ${channel}.`);
  }
}
