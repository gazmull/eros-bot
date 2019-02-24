import { TextChannel } from 'discord.js';
import ErosCommand from '../../struct/command';

export default class extends ErosCommand {
  constructor () {
    super('clear', {
      aliases: [ 'clear' ],
      description: {
        content: 'Clears a text channel from based on limit specified messages. Default: 99 messages.',
        usage: '[limit] [me | bot | all]',
        examples: [ '25', 'me 25' ]
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
        },
      ]
    });
  }

  public async exec (message: Message, { amount, type }: { amount: number, type: string }) {
    try {
      const channel = message.channel as TextChannel;
      if (channel.topic && channel.topic.match(/<clear:no>/gi))
        return message.util.reply('clear command for this channel is restricted.');

      const messages = await channel.messages.fetch({ limit: amount });

      switch (type) {
        case 'all': {
          channel.bulkDelete(messages, true);
          break;
        }
        case 'me': {
          const filterMessages = messages.filter(
            m => m.author.id === message.author.id && !m.pinned &&
          !m.content.match(/<clear:no>/gi) && Date.now() - m.createdTimestamp < 1210000000
          );
          channel.bulkDelete(filterMessages);
          break;
        }
        case 'bot': {
          const filterMessages = messages.filter(
            m => m.author.id === this.client.user.id && !m.pinned &&
          !m.content.match(/<clear:no>/gi) && Date.now() - m.createdTimestamp < 1210000000
          );
          channel.bulkDelete(filterMessages);
          break;
        }
        default: {
          const filterMessages = messages.filter(
            m => !m.pinned && !m.content.match(/<clear:no>/gi) &&
          Date.now() - m.createdTimestamp < 1210000000
          );
          channel.bulkDelete(filterMessages);
        }
      }
    } catch (err) { this.emitError(err, message, this); }
  }
}
