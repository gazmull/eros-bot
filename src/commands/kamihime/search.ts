import { Message, TextChannel } from 'discord.js';
import fetch from 'node-fetch';
import { IKamihimeDB } from '../../../typings';
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
      noTrash: true,
      args: [
        {
          id: 'character',
          match: 'text',
          type: (_, word) => {
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

  public async exec (
    message: Message,
    { character, advanced, isID }: { character: string, advanced: boolean, isID: boolean }
  ) {
    try {
      const { emojis, url } = this.client.config;

      await message.util.send(`${emojis.loading} Awaiting KamihimeDB's response...`);

      if (isID) return this.searchID(message, character);

      const data = await fetch(
        `${url.api}search?name=${encodeURI(character)}`,
        { headers: { Accept: 'application/json' } }
      );
      const result = await data.json();

      if (result.error) throw result.error.message;
      if (!result.length) throw RangeError(`There are no matching items found with ${character.toUpperCase()}`);

      const Pagination = this.client.fields<IKamihimeDB>(message)
        .setAuthorizedUsers(message.author.id)
        .setChannel(message.channel as TextChannel)
        .setClientAssets({ message: message.util.lastResponse })
        .setArray(result);

      Pagination.embed
        .setTitle(`${character.toUpperCase()} | Found: ${result.length}`)
        .addField('Help', 'React with the emoji below to navigate. ↗ to skip a page.');

      if (advanced) Pagination.formatField('# - ID', i => `${result.indexOf(i) + 1} - ${i.id}`);

      Pagination.formatField('Name', i => i.name);

      return Pagination.build();
    } catch (err) { this.handler.emitError(err, message, this, 1); }
  }

  public async searchID (message: Message, character: string) {
    try {
      const data = await fetch(
        `${this.client.config.url.api}id/${character}`,
        { headers: { Accept: 'application/json' } }
      );
      const _character = await data.json();

      if (_character.error) throw new Error(`ID ${character} does not exist.`);

      return message.util.edit(`ID ${character} does exist.`);
    } catch (err) { this.handler.emitError(err, message, this, 1); }
  }
}
