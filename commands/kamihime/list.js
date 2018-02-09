const { Command } = require('discord-akairo');
const { get } = require('snekfetch');

const { loading } = require('../../auth').emojis;
const { defaultPrefix } = require('../../auth');

class ListCommand extends Command {
  constructor() {
    super('list', {
      aliases: ['list', 'l'],
      description: {
        content: [
          'Displays results based on your arguments.',
          'See `list --variables` for a list of available variables'
        ],
        usage: '<filter variable>',
        examples: ['kamihime', 'kh', 'eido', 'fire', 'approved']
      },
      clientPermissions: ['ADD_REACTIONS', 'MANAGE_MESSAGES', 'EMBED_LINKS'],
      args: [
        {
          id: 'filter',
          match: 'text',
          prompt: {
            start: msg => 'how do you want to filter a list of results?'
              + `You may see ${this.handler.prefix(message)}list --variables for a list of available filter variables.`
          }
        },
        {
          id: 'flag',
          match: 'flag',
          prefix: '--variables'
        }
      ]
    });
  }

  exec(message) {
    return message.reply('not available. Come back later!')
  }
}