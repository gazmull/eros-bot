import ErosComamnd from '../../struct/command';

export default class extends ErosComamnd {
  constructor () {
    super('say', {
      aliases: [ 'say' ],
      description: {
        content: 'Lets you say something in the chat in my stead.',
        usage: '<words>',
        examples: [ 'rawr', 'im hacker pls gibbe money' ]
      },
      channel: 'guild',
      lock: 'channel',
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
    return message.util.send(words);
  }
}
