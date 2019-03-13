import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import ErosCommand from '../../struct/command';

export default class extends ErosCommand {
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
          '\t- `loli`',
          '\t- `nsfwchannel`',
          '\t- `nsfwrole`',
          '\t- `prefix`',
          '\t- `twitter`',
          '\t- `twitterchannel`',
        ],
        usage: '<settings> [value]',
        examples: [
          'cdchannel #re-countdown',
          'countdownchannel re-countdown',
          'cdrole @cd subscriber',
          'countdownrole cd subscriber',
          'loli',
          'nsfwchannel re-nsfw',
          'nsfwrole pervert',
          'prefix e?',
          'twitter twitter-updates',
          'twitterchannel #twitter-updates',
        ]
      },
      userPermissions: [ 'MANAGE_GUILD' ],
      channel: 'guild',
      ratelimit: 2,
      args: [
        {
          id: 'method',
          type: [
            'cdchannel',
            'countdownchannel',
            'cdrole',
            'countdownrole',
            'loli',
            'nsfwchannel',
            'nsfwrole',
            'prefix',
            'twitter',
            'twitterchannel',
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
      cdchannel: this.handler.modules.get('set-countdownchannel'),
      countdownchannel: this.handler.modules.get('set-countdownchannel'),
      cdrole: this.handler.modules.get('set-countdownrole'),
      countdownrole: this.handler.modules.get('set-countdownrole'),
      loli: this.handler.modules.get('set-loli'),
      nsfwchannel: this.handler.modules.get('set-nsfwchannel'),
      nsfwrole: this.handler.modules.get('set-nsfwrole'),
      prefix: this.handler.modules.get('set-prefix'),
      twitter: this.handler.modules.get('set-twitterchannel'),
      twitterchannel: this.handler.modules.get('set-twitterchannel')
    };
    const command = commands[method];

    return this.handler.handleDirectCommand(message, details, command, true);
  }
}
