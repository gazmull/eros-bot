import { Command } from 'discord-akairo';
import ErosCommand from '../../struct/command';

export default class extends ErosCommand {
  constructor () {
    super('tag', {
      aliases: [ 'tag' ],
      description: {
        content: [
          'Displays a list of tags from the current server or the specified member.',
          'Available Methods:',
          '\t- `add`',
          '\t- `del`',
          '\t- `delete`',
          '\t- `edit`',
          '\t- `info`',
          '\t- `leaderboard`',
          '\t- `show`',
          '\t- `source`',
        ],
        usage: '<method> <arguments>',
        examples: [
          'add SoS Yo --hoist',
          'add xd ROFL',
          'delete SoS',
          'edit Jump In the caAc --hoist',
          'edit SoS caAc',
          'info Leon',
          'leaderboard 5',
          'show Leon',
          'source xd',
          'tags @Eros',
        ]
      },
      channel: 'guild',
      ratelimit: 2,
      args: [
        {
          id: 'method',
          type: [
            'add',
            'del',
            'delete',
            'edit',
            'info',
            'leaderboard',
            'show',
            'source',
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
      add: this.handler.modules.get('tag-add'),
      del: this.handler.modules.get('tag-delete'),
      delete: this.handler.modules.get('tag-delete'),
      edit: this.handler.modules.get('tag-edit'),
      info: this.handler.modules.get('tag-info'),
      leaderboard: this.handler.modules.get('tag-leaderboard'),
      show: this.handler.modules.get('tag-show'),
      source: this.handler.modules.get('tag-source')
    };
    const command = commands[method];

    return this.handler.handleDirectCommand(message, details, command, true);
  }
}
