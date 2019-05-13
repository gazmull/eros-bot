import { Flag } from 'discord-akairo';
import { Message } from 'discord.js';
import fetch from 'node-fetch';
import { URL, URLSearchParams } from 'url';
import ErosComamnd from '../../struct/command';

const FULL_OF_DETERMINATION = [
  'Ny— not gonna happen.',
  'Are you taking me for a cat?',
  'Hee... you have that kind of fetish?',
  'I-it\'s not like I d-don\'t want to... b-but... ny... nyaaAAAAaaaA *runs away from embarassment*',
  'H-how did you know that I have... c-cat ears? *quivers in fear*',
];

export default class extends ErosComamnd {
  constructor () {
    super('owo', {
      aliases: [ 'owo', 'owoify' ],
      description: {
        content: 'Wets you say somethinyg iny the chat iny my stead (=ↀωↀ=)✧',
        usage: '<words>',
        examples: [ 'rawr', 'nyaaa' ]
      },
      channel: 'guild',
      lock: 'user'
    });
  }

  public async * args (message: Message) {
    if (([ 0, 1, 0 ][Math.floor(Math.random() * 3)]) === 0) {
      await message.channel.send(FULL_OF_DETERMINATION[Math.floor(Math.random() * FULL_OF_DETERMINATION.length)]);

      return Flag.cancel();
    }

    const words = yield {
      match: 'rest',
      default: null,
      prompt: {
        modifyStart: (msg: Message) => [
          `${msg.author}, *tilts head* what wouwd you wike to say?`,
          '\ntype `canycew` to canycew this commanyd ヾ(=｀ω´=)ノ',
        ],
        cancelWord: 'canycew',
        cancel: '*nods* okay if that\'s what you wanyt!',
        timeout: '*yawns* awe you fwozeny ow what?'
      }
    };

    return { words };
  }

  public async exec (message: Message, { words: text }: { words: string }) {
    if (message.deletable) await message.delete();

    const url = new URL('https://nekos.life/api/v2/owoify');
    url.search = new URLSearchParams({ text }).toString();

    const res = await fetch(url.toString());

    if (!res.ok) return message.util.send('*sobs* sowwy onyii-chany, I canynyot finyd nyeko-nyee...');

    const { owo }: { owo: string } = await res.json();

    return message.util.send(owo);
  }
}
