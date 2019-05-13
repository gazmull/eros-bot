import { Flag } from 'discord-akairo';
import { Message } from 'discord.js';
import Command from '../../struct/command';

export default class extends Command {
  constructor () {
    super('level', {
      aliases: [ 'level' ],
      description: {
        content: [
          'Parent command of leveling system.',
          'Available Methods:',
          '\t- `info`',
          '\t- `i`',
          '\t- `leaderboard`',
        ],
        usage: '<method> [arguments]',
        examples: [
          'info @Euni',
          'i @Euni',
          'leaderboard 5',
        ]
      },
      channel: 'guild',
      ratelimit: 2
    });
  }

  public * args () {
    const child = yield {
      type: [
        [ 'memberinfo', 'i', 'info' ],
        [ 'level-leaderboard', 'leaderboard' ],
      ],
      otherwise: (message: Message) => {
        const HelpCommand = this.handler.modules.get('help');
        this.handler.runCommand(message, HelpCommand, { command: this });

        return null;
      }
    };

    return Flag.continue(child, true);
  }
}
