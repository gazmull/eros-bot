import { Message, TextChannel } from 'discord.js';
import Command from '../../struct/command';

export default class extends Command {
  constructor () {
    super('set-twitterchannel', {
      description: {
        content: 'Changes the server\'s Twitter Channel.',
        usage: '<channel>',
        examples: [ '#newbie-lib-questions-not-other-js', '312874659902115460', 'twitter' ]
      },
      args: [
        {
          id: 'channel',
          type: 'textChannel',
          default: null,
          prompt: {
            start: 'what would you like to set the Twitter Channel to?',
            retry: 'please provide a valid channel.'
          }
        },
      ]
    });
  }

  public async exec (message: Message, { channel }: { channel: TextChannel }) {
    await this.client.db.Guild.update(
      { twitterChannel: channel.id },
      { where: { id: message.guild.id } }
    );

    return message.util.reply(`I have changed the Twitter Channel to ${channel}.`);
  }
}
