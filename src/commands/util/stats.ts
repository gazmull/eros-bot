import { version as akairoVersion } from 'discord-akairo';
import { version as discordVersion } from 'discord.js';
// @ts-ignore
import { version as kamihimedbVersion } from '../../../../kamihimedb/package.json';
// @ts-ignore
import { description, version as erosVersion } from '../../../package.json';
import prettyMilliseconds from '../..//util/prettyMilliseconds';
import Command from '../../struct/command/Command';

export default class extends Command {
  constructor () {
    super('stats', {
      aliases: [ 'stats', 'status', 'about', 'aboutme' ],
      description: { content: 'Displays my information.' }
    });
  }

  public exec (message: Message) {
    return message.util.send(
      this.util.embed(message)
        .setTitle('Eros')
        .setDescription(description)
        .setThumbnail(this.client.user.displayAvatarURL({ format: 'webp', size: 128 }))
        .addField('Author', this.client.users.get(this.client.ownerID as string), true)
        .addField('Libraries and Applications', [
          '**Discord.JS**: v' + discordVersion,
          '**Akairo**: v' + akairoVersion,
          '**KamihimeDB**: v' + kamihimedbVersion,
          '**Eros**: v' + erosVersion,
        ], true)
        .addField('Discord', [
          '**Servers**: ' + this.client.guilds.size,
          '**Channels**: ' + this.client.channels.size,
          '**Users**: ' + this.client.users.size,
        ], true)
        .addField('System', [
          '**Uptime**: ' + prettyMilliseconds(this.client.uptime),
          `**Memory**: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
        ], true)
    );
  }
}
