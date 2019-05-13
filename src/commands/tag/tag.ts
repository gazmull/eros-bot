import { Flag } from 'discord-akairo';
import { Message } from 'discord.js';
import Command from '../../struct/command';

export default class extends Command {
  constructor () {
    super('tag', {
      aliases: [ 'tag' ],
      description: {
        content: [
          'Parent command of tag system.',
          'Available Methods:',
          '\t- `add`',
          '\t- `del`',
          '\t- `delete`',
          '\t- `edit`',
          '\t- `find`',
          '\t- `info`',
          '\t- `leaderboard`',
          '\t- `list`',
          '\t- `search`',
          '\t- `show`',
          '\t- `source`',
        ],
        usage: '<method> [arguments]',
        examples: [
          'add myText Content --hoist',
          'add myText Content',
          'delete myText',
          'edit myText --hoist',
          'edit "With Spaces" Content',
          'find with spaces',
          'info myText',
          'leaderboard 5',
          'list nutaku employee impersonator',
          'search stale kh memes',
          'show myText',
          'source burst attack',
        ]
      },
      channel: 'guild',
      ratelimit: 2
    });
  }

  public * args () {
    const child = yield {
      type: [
        [ 'tag-add', 'add' ],
        [ 'tag-delete', 'del', 'delete' ],
        [ 'tag-edit', 'edit' ],
        [ 'tag-info', 'i', 'info' ],
        [ 'tag-leaderboard', 'leaderboard', 'lb' ],
        [ 'tag-list', 'list', 'l' ],
        [ 'tag-show', 'show' ],
        [ 'tag-source', 'source', 'raw' ],
        [ 'tag-search', 'search', 'find' ],
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
