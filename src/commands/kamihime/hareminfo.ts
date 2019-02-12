import { PrefixSupplier } from 'discord-akairo';
import { TextChannel } from 'discord.js';
import fetch from 'node-fetch';
// @ts-ignore
import { emojis, url } from '../../../auth';
import Command from '../../struct/command';
import ErosClient from '../../struct/ErosClient';

export default class extends Command {
  constructor () {
    super('hareminfo', {
      aliases: [ 'hareminfo', 'hinfo', 'hi', 'peek', 'p' ],
      description: {
        content: 'Sends a list of Harem Episodes of a character.',
        usage: '<character name>',
        examples: [ 'eros', 'mars' ]
      },
      lock: 'user',
      args: [
        {
          id: 'character',
          match: 'text',
          type: name => {
            if (!name || name.length < 2) return null;

            return name;
          },
          prompt: {
            start: 'whose episodes information would you like to obtain?',
            retry: 'please provide an input with 2 characters and above.'
          }
        },
      ]
    });

    this.rassedMsg = [
      'b-but why m-me?!',
      'I have the b-best scene... right?!',
      'p-pervert!!!',
      'y-you came to see me, or you came to... *c-come* in me?!',
      'we already did this before... s-secretly... didn\'t we?',
    ];
  }

  protected rassedMsg: string[];

  public async exec (message, { character }: { character: string }) {
    try {
      await message.util.send(`${emojis.loading} Awaiting KamihimeDB's response...`);

      const request = await fetch(`${url.api}search?name=${encodeURI(character)}`, {
        headers: { Accept: 'application/json' }
      });
      const data = await request.json();

      if (data.error) throw data.error.message;

      const rows = (data).filter(c => ![ 'x', 'w' ].includes(c.id.charAt(0)));

      if (!rows.length) return message.util.edit(`No character named ${character} found.`);
      else if (rows.length === 1) {
        const result = rows.shift();
        const _request = await fetch(`${url.api}id/${result.id}`, { headers: { Accept: 'application/json' } });
        const _data = await _request.json();

        if (_data.error) throw _data.error.message;

        return await this.triggerDialog(message, _data);
      }

      await this.awaitSelection(message, rows);
    } catch (err) { this.emitError(err, message, this, 1); }
  }

  public async awaitSelection (message: Message, rows: IKamihimeDB[]) {
    const client = this.client as ErosClient;
    const character = await client.util.selection.exec(message, rows);

    if (!character) return;

    const data = await fetch(`${url.api}id/${character.id}`, { headers: { Accept: 'application/json' } });
    const _character = await data.json();

    if (_character.error) throw _character.error.message;

    await this.triggerDialog(message, _character);
  }

  public async triggerDialog (message: Message, result: IKamihimeDB) {
    const client = this.client as ErosClient;

    try {
      const prefix = (this.handler.prefix as PrefixSupplier)(message);
      const guild = message.guild;
      const restricted = guild ? client.guildSettings.get(guild.id, 'loli', null) : null;

      if (result.loli && restricted)
        throw new Error(`This character has loli contents, but loli contents are restricted within this guild.${
          message.author.id === message.guild.ownerID
            ? ` Please configure your Loli Contents Restriction via ${prefix}loli`
            : ' Please contact the guild owner.'
        }`);

      await message.util.edit(`${emojis.emojis.loading} Preparing...`, { embed: null });

      const harems = [
        {
          title: result.harem1Title || 'Untitled',
          links: [
            result.harem1Resource1
              ? `${url.player}${result.id}/1/story`
              : null,
          ]
        },
        {
          title: result.harem2Title || 'Untitled',
          links: [
            result.harem2Resource1
              ? `${url.player}${result.id}/2/story`
              : null,
            result.harem2Resource2
              ? `${url.player}${result.id}/2/scenario`
              : null,
            result.harem2Resource2
              ? `${url.player}${result.id}/2/legacy`
              : null,
          ]
        },
        {
          title: result.harem3Title || 'Untitled',
          links: [
            result.harem3Resource1
              ? `${url.player}${result.id}/3/story`
              : null,
            result.harem3Resource2
              ? `${url.player}${result.id}/3/scenario`
              : null,
            result.harem3Resource2
              ? `${url.player}${result.id}/3/legacy`
              : null,
          ]
        },
      ];
      const thumbnail = encodeURI(`${url.root}img/wiki/portrait/${result.name} Portrait.png`);
      const embed = this.util.embed(message)
        .setColor(0xFF75F1)
        .setAuthor(result.name, null, `${url.fandom}${encodeURI(result.name)}`)
        .setDescription(
          `${result.loli ? '**Flagged as Loli**' : ''}${
            result.name.toLowerCase() === (client.user.username.toLowerCase())
              ? `\n... ${this.rassedMsg[Math.floor(Math.random() * this.rassedMsg.length)]} ${emojis.embarassed}`
              : ''}`
        )
        .setThumbnail(thumbnail);

      for (let i = 1; i <= 3; i++) {
        const ep = harems[i - 1];
        if (i === 1) {
          embed.addField(
            `Episode ${i}: ${ep.title}`,
            ep.links[0] ? `[Story](${ep.links[0]})` : 'N/A',
            false
          );
          continue;
        }
        if (ep.title === 'Untitled' && !ep.links[0] && !ep.links[1]) continue;
        embed.addField(`Episode ${i}: ${ep.title}`,
          [
            ep.links[0] ? `[Story](${ep.links[0]})` : 'N/A',
            ep.links[1] ? `[Scenario](${ep.links[1]})` : 'N/A',
            ep.links[2] ? `[Legacy](${ep.links[2]})` : 'N/A',
          ],
          true
        );
      }

      const channel = message.channel as TextChannel;

      if (!channel.guild)
        return message.util.edit({ embed });

      const nsfwChannelID = client.guildSettings.get(guild.id, 'nsfwChannelID', null);
      const nsfwChannel = guild.channels.get(nsfwChannelID) as TextChannel;

      if (!nsfwChannel)
        throw new Error(`NSFW Channel is not configured.${
          message.author.id === guild.ownerID
            ? ` Please configure your NSFW Channel via ${prefix}nsfwchannel`
            : ' Please contact the guild owner.'
        }`);

      if (channel.id === nsfwChannelID)
        return message.util.edit({ embed });

      await nsfwChannel.send({ embed });

      return message.util.edit(
        `I have sent my response at ${nsfwChannel}. If you have no access to that channel, say \`${prefix}nsfw\`.`
      );
    } catch (err) { this.emitError(err, message, this, 1); }
  }
}
