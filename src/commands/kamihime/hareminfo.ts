import { Message, Message as MSG, TextChannel } from 'discord.js';
import { IKamihimeDB } from '../../../typings';
import ErosInfoCommand from '../../struct/command/ErosInfoCommand';

export default class extends ErosInfoCommand {
  constructor () {
    super('hareminfo', {
      aliases: [ 'hareminfo', 'hinfo', 'hi', 'peek', 'p' ],
      description: {
        content: 'Sends a list of Harem Episodes of a character from Kamihime Database.',
        usage: '<character name> [--accurate]',
        examples: [ 'eros', 'mars' ]
      },
      lock: 'user',
      args: [
        {
          id: 'item',
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
        {
          id: 'accurate',
          match: 'flag',
          flag: [ '-a', '--accurate' ]
        },
      ]
    });
  }

  protected rassedMsg = [
    'b-but why m-me?!',
    'I have the b-best scene... right?!',
    'p-pervert!!!',
    'y-you came to see me, or you came to... *c-come* inside me?!',
    'we already did this before... s-secretly... didn\'t we?',
  ];

  public async exec (message: Message, { item, accurate }: { item: string, accurate: boolean }) {
    try {
      const character: IKamihimeDB | Message = await super.exec(message, { item, approved: false, accurate });

      if (!character || character instanceof MSG) return;

      return this.triggerDialog(message, character);
    } catch (err) { this.emitError(err, message, this, 1); }
  }

  public async triggerDialog (message: Message, result: IKamihimeDB) {
    try {
      const { url, emojis } = this.client.config;
      const prefix = await this.handler.prefix(message);
      const guild = message.guild
        ? await this.client.db.Guild.findOne({
          where: { id: message.guild.id },
          attributes: [ 'loli', 'nsfwChannel', 'nsfwRole' ]
        })
        : null;

      if (result.loli && guild && guild.loli)
        return message.util.edit(
          `${message.author}, this character has loli contents, but loli contents are restricted within this server.${
            message.author.id === message.guild.ownerID
              ? ` Please configure your Loli Contents Restriction via \`${prefix}set loli\``
              : ' Please contact the server owner.'
          }`
        );

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
            new RegExp(result.name.replace(/[()]/g, '\\$&')).test(this.client.user.username)
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
        return message.util.edit(embed);

      const nsfwChannel = message.guild.channels.get(guild!.nsfwChannel) as TextChannel;

      if (!nsfwChannel)
        return message.util.edit(`${message.author}, NSFW Channel is not configured.${
          message.author.id === message.guild.ownerID
            ? ` Please configure your NSFW Channel via \`${prefix}set nsfwchannel\``
            : ' Please contact the server owner.'
        }`);

      if (channel.id === guild.nsfwChannel)
        return message.util.edit(embed);

      await nsfwChannel.send(embed);

      return message.util.edit([
        `${message.author}, I have sent my response at ${nsfwChannel}.`,
        guild.nsfwRole ? ` If you have no access to that channel, say \`${prefix}nsfw\`.` : '',
      ]);
    } catch (err) { this.emitError(err, message, this, 1); }
  }
}
