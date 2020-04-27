import { Flag } from 'discord-akairo';
import { Message } from 'discord.js';
import Command from '../../struct/command';

export default class extends Command {
  constructor () {
    super('set', {
      aliases: [ 'set' ],
      description: {
        content: [
          'Lets you configure your server\'s settings for the bot.',
          'Available Settings:',
          '\t- `cdchannel`',
          '\t- `countdownchannel`',
          '\t- `cdrole`',
          '\t- `countdownrole`',
          '\t- `nsfwchannel`',
          '\t- `nsfwrole`',
          '\t- `prefix`',
          '\t- `twitter`',
          '\t- `twitterchannel`',
        ],
        usage: '<settings> <value>',
        examples: [
          'cdchannel #re-countdown',
          'countdownchannel re-countdown',
          'cdrole @cd subscriber',
          'countdownrole cd subscriber',
          'nsfwchannel re-nsfw',
          'nsfwrole pervert',
          'prefix e?',
          'twitter twitter-updates',
          'twitterchannel #twitter-updates',
        ]
      },
      userPermissions: [ 'MANAGE_GUILD' ],
      channel: 'guild',
      ratelimit: 2
    });
  }

  public * args () {
    const child = yield {
      type: [
        [ 'set-countdownchannel', 'cdchannel', 'countdownchannel' ],
        [ 'set-countdownrole', 'cdrole', 'countdownrole' ],
        [ 'set-nsfwchannel', 'nsfwchannel' ],
        [ 'set-nsfwrole', 'nsfwrole' ],
        [ 'set-prefix', 'prefix' ],
        [ 'set-twitterchannel', 'twitter', 'twitterchannel' ],
      ],
      otherwise: (message: Message) => {
        const HelpCommand = this.handler.modules.get('help');
        this.handler.runCommand(message, HelpCommand, { command: this });

        return null;
      }
    };

    return Flag.continue(child);
  }
}
