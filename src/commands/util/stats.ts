import { version as akairoVersion } from 'discord-akairo';
import { version as paginationVersion } from 'discord-paginationembed';
import { Message, version as discordVersion } from 'discord.js';
import fetch from 'node-fetch';
import * as os from 'os';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { description, homepage, version as erosVersion } from '../../../package.json';
import Command from '../../struct/command';
import prettifyMs from '../../util/prettifyMs';

export default class extends Command {
  constructor () {
    super('stats', {
      aliases: [ 'stats', 'status', 'about', 'aboutme' ],
      description: { content: 'Displays my information.' }
    });
  }

  public async exec (message: Message) {
    let kamihimedbVersion: string;
    const { docs, url } = this.client.config;
    const response = await fetch(`${url.api}version`, { headers: { Accept: 'application/json' } });

    if (!response.ok) kamihimedbVersion = '2.what.ever';

    kamihimedbVersion = (await response.json()).version;

    const _description = [
      description,
      '',
      `[**Source Code**](${homepage}) | [**Bot Documentation & Guide**](${docs})`,
    ];

    return message.util.send(
      this.client.embed(message)
        .setTitle('Eros')
        .setDescription(_description)
        .setThumbnail(this.client.user.displayAvatarURL({ format: 'webp', size: 128 }))
        .setImage(`${homepage.split('#').shift()}/blob/master/${encodeURI('エロース')}.webp?raw=true`)
        .addField('Author', this.client.users.cache.get(this.client.ownerID as string)?.tag, true)
        .addField('Libraries and Applications', [
          `**Discord.JS**: v${discordVersion}`,
          `**Akairo**: v${akairoVersion}`,
          `**PaginationEmbed**: v${paginationVersion}`,
          `**KamihimeDB**: v${kamihimedbVersion}`,
          `**Eros**: v${erosVersion}`,
        ], true)
        .addField('Discord', [
          `**Servers**: ${this.client.guilds.cache.size}`,
          `**Channels**: ${this.client.channels.cache.size}`,
          `**Users**: ${this.client.users.cache.size}`,
        ], true)
        .addField('System', [
          `**Uptime**: ${prettifyMs(this.client.uptime)}`,
          `**Memory**: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
          `**NodeJS**: ${process.version}`,
          `**OS**: ${os.type()} ${os.arch()}`,
        ], true)
    );
  }
}
