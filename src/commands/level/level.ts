import { Command } from 'discord-akairo';
import ErosCommand from '../../struct/command';

export default class extends ErosCommand {
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
      ratelimit: 2,
      args: [
        {
          id: 'method',
          type: [
            'i',
            'info',
            'leaderboard',
          ]
        },
        {
          id: 'details',
          match: 'rest',
          default: ''
        },
      ]
    });
  }

  public async exec (message: Message, { method, details }: { method: string, details: string }) {
    if (!method)
      return this.handler.modules.get('help').exec(message, { command: this });

    const commands: { [key: string]: Command } = {
      i: this.handler.modules.get('memberinfo'),
      info: this.handler.modules.get('memberinfo'),
      leaderboard: this.handler.modules.get('level-leaderboard')
    };
    const command = commands[method];

    return this.handler.handleDirectCommand(message, details, command, true);
  }
}
