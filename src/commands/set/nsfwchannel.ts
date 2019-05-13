import { Message, TextChannel } from 'discord.js';
import Command from '../../struct/command';

export default class extends Command {
  constructor () {
    super('set-nsfwchannel', {
      description: {
        content: 'Changes the server\'s NSFW Channel.',
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
    await this.client.db.Guild.update(
      { nsfwChannel: channel.id },
      { where: { id: message.guild.id } }
    );

    return message.util.reply(`I have changed the NSFW Channel to ${channel}.`);
  }
}
