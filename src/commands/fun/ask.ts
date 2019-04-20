import { Message } from 'discord.js';
import fetch from 'node-fetch';
import { IKamihimeDB } from '../../../typings';
import ErosComamnd from '../../struct/command';

const END_POINT = 'https://8ball.delegator.com/magic/JSON/';
const punctations = (type: IMagic8['magic']['type'], answer: string) => ({
  Affirmative: '✓ ' + answer,
  Neutral: '... ' + answer,
  Contrary: ':x: ' + answer
}[type]) as string;

export default class extends ErosComamnd {
  constructor () {
    super('ask', {
      aliases: [ 'ask', '8ball' ],
      description: {
        content: 'Ask a question to a random Kamihime PROJECT Character.',
        usage: '<question>?',
        examples: [ 'Am I a rawricon?', 'Will I pull hecatonchires again (oh gods please no)?' ]
      },
      args: [
        {
          id: 'question',
          match: 'rest',
          type: 'question',
          prompt: {
            start: 'what would you like to ask?',
            retry: 'that is not a valid question (it should end with a question mark). Try again!'
          }
        },
      ]
    });
  }

  public async exec (message: Message, { question }: { question: string }) {
    await message.util.send('Hmm...');

    const param = encodeURIComponent(question);
    const response = await fetch(END_POINT + param);

    if (!response.ok) return message.util.edit('There was a problem: ' + response.statusText);

    const { magic: { answer, type } }: IMagic8 = await response.json();
    const url = this.client.config.url;
    const cherryResponse = await fetch(url.api + 'random', { headers: { Accept: 'application/json' } });

    if (!response.ok) return message.util.edit('There was a problem: ' + response.statusText);

    const { id, name, avatar } = (await cherryResponse.json() as IKamihimeDB[]).shift();
    const embed = this.client.embed()
      .setAuthor(name, null, url.root + `info/${id}`)
      .setThumbnail(url.root + encodeURIComponent(`img/wiki/${avatar}`))
      .setDescription(punctations(type, answer));

    return message.util.edit(null, embed);
  }
}

interface IMagic8 {
  magic: {
    question: string;
    answer: string;
    type: 'Affirmative' | 'Neutral' | 'Contrary';
  };
}
