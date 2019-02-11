import fetch from 'node-fetch';
// @ts-ignore
import { emojis, url } from '../../../auth';
import Command from '../../struct/command';

export default class extends Command {
  constructor () {
    super('search', {
      aliases: [ 'search', 'get', 'find' ],
      description: {
        content: 'Searches for characters matched with your input.',
        usage: '<character name>',
        examples: [ 'eros', 'mars' ]
      },
      lock: 'user',
      paginated: true,
      args: [
        {
          id: 'character',
          match: 'text',
          type: word => {
            if (!word || word.length < 2) return null;

            return word;
          },
          prompt: {
            start: 'what input would you like to search for characters?',
            retry: 'please provide an input with 2 characters and above.'
          }
        },
        {
          id: 'advanced',
          match: 'flag',
          flag: [ '-d', '--dev', '--advanced' ]
        },
        {
          id: 'isID',
          match: 'flag',
          flag: [ '-i', '--id' ]
        },
      ]
    });
  }

  public async exec (message: Message, { character, advanced, isID }) {
    try {
      await message.util.send(`${emojis.loading} Awaiting KamihimeDB's response...`);

      if (isID) return this.searchID(message, character);

      const data = await fetch(`${url.api}search?name=${encodeURI(character)}`, {
        headers: { Accept: 'application/json' }
      });
      const result = await data.json();

      if (result.error) throw result.error.message;

      const embed = this.util.fields(message)
        .setAuthorizedUsers([ message.author.id ])
        .setChannel(message.channel)
        .setClientMessage(message.util.lastResponse, `${emojis.loading} Preparing...`)
        .setArray(result)
        .setTitle(`${character.toUpperCase()} | Found: ${result.length}`)
        .showPageIndicator(false)
        .setTimeout(60 * 1000)
        .addField('Help', 'React with the emoji below to navigate. ↗ to skip a page.');

      if (advanced) embed.formatField('# - ID', i => `${result.indexOf(i) + 1} - ${i.id}`);
      embed.formatField('Name', i => i.name);

      return await embed.build();
    } catch (err) { this.emitError(err, message, this, 1); }
  }

  public async searchID (message: Message, character: string) {
    try {
      const data = await fetch(`${url.api}id/${character}`, { headers: { Accept: 'application/json' } });
      const _character = await data.json();

      if (_character.error) throw new Error(`ID ${character} does not exist.`);

      return message.util.edit(`ID ${character} does exist.`);
    } catch (err) { this.emitError(err, message, this, 1); }
  }
}
