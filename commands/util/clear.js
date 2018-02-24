const { Command } = require('discord-akairo');

const { error } = require('../../utils/console');

class ClearCommand extends Command {
  constructor() {
    super('clear', {
      aliases: ['clear'],
      description: {
        content: 'Clears a text channel from based on limit specified messages. Default: 99 messages.',
        usage: '<limit> <optional me | bot | all>',
        examples: ['25', 'me 25']
      },
      ownerOnly: true,
      channel: 'guild',
      args: [
        {
          id: 'amount',
          type: 'integer',
          default: 100
        },
        {
          id: 'type',
          type: 'string',
          default: null
        }
      ]
    });
  }

  async exec(message, { amount, type }) {
    try {
      if (message.channel.topic && message.channel.topic.match(/<clear:no>/gi))
        return message.reply('clear command for this channel is restricted.');

      const messages = await message.channel.messages.fetch({ limit: amount });

      switch (type) {
      case 'all': {
        message.channel.bulkDelete(messages, true);
        break;
      }
      case 'me': {
        const filterMessages = messages.filter(
          m => m.author.id === message.author.id && !m.pinned &&
          !m.content.match(/<clear:no>/gi) && Date.now() - m.createdTimestamp < 1210000000
        );
        message.channel.bulkDelete(filterMessages);
        break;
      }
      case 'bot': {
        const filterMessages = messages.filter(
          m => m.author.id === this.client.user.id && !m.pinned &&
          !m.content.match(/<clear:no>/gi) && Date.now() - m.createdTimestamp < 1210000000
        );
        message.channel.bulkDelete(filterMessages);
        break;
      }
      default: {
        const filterMessages = messages.filter(
          m => !m.pinned && !m.content.match(/<clear:no>/gi) &&
          Date.now() - m.createdTimestamp < 1210000000
        );
        message.channel.bulkDelete(filterMessages);
      }
      }
    } catch (err) {
      error(err.stack);
    }
  }
}

module.exports = ClearCommand;