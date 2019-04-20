import { Message } from 'discord.js';
import ErosComamnd from '../../struct/command';

export default class extends ErosComamnd {
  constructor () {
    super('mock', {
      aliases: [ 'mock' ],
      description: {
        content: 'Lets you say something in the chat in my stead but it is retarded.',
        usage: '<words>',
        examples: [ 'rawr', 'ur mum ghei' ]
      },
      channel: 'guild',
      lock: 'user',
      args: [
        {
          id: 'words',
          match: 'rest',
          default: null,
          prompt: {
            start: 'what would you like to say?',
            retry: 'you got nothing to say? The hell?'
          }
        },
      ]
    });
  }

  public async exec (message: Message, { words }: { words: string }) {
    if (message.deletable) await message.delete();

    const retardedWords = words.split('').map((v, i) => !(i % 2) ? v.toLowerCase() : v.toUpperCase()).join('');

    return message.util.send(retardedWords);
  }
}
