import { PrefixSupplier } from 'discord-akairo';
import { TextChannel } from 'discord.js';
import ErosCommand from '../../struct/command';
import toTitleCase from '../../util/toTitleCase';

export default class extends ErosCommand {
  constructor () {
    super('help', {
      aliases: [ 'help', 'commands' ],
      description: {
        content: 'Displays available commands or command information',
        usage: '[command name]',
        examples: [ '', 'ping', 'info' ]
      },
      args: [
        {
          id: 'command',
          type: 'commandAlias'
        },
        {
          id: 'pub',
          type: 'string',
          match: 'flag',
          flag: [ '--pub', '--public' ]
        },
      ]
    });
  }

  public exec (message: Message, { command, pub }: { command: ErosCommand, pub: boolean }) {
    const prefix = (this.handler.prefix as PrefixSupplier)(message);
    if (!command) return this.defaultHelp(message, pub);

    const clientPermissions = command.clientPermissions as string[];
    const userPermissions = command.userPermissions as string[];
    const flags: Array<{ names: string[], value: string }> = command.description.flags;
    const examples: string[] = command.description.examples;

    const embed = this.util.embed(message)
      .setTitle(`${prefix}${command} ${command.description.usage ? command.description.usage : ''}`)
      .setDescription(command.description.content);

    if (clientPermissions)
      embed.addField('Required Bot Permissions', clientPermissions.map(p => `\`${toTitleCase(p)}\``).join(', '));
    if (userPermissions)
      embed.addField('Required User Permissions:', userPermissions.map(p => `\`${toTitleCase(p)}\``).join(', '));
    if (command.aliases.length > 1)
      embed.addField('Aliases', command.aliases.slice(1).map(a => `\`${a}\``).join(', '));
    if (flags)
      embed.addField('Flags', flags.map(f => `**${f.names.join(' ')}**\n\t${f.value}`));
    if (examples)
      embed.addField('Examples', examples.map(e => `${prefix}${command} ${e}`).join('\n'));

    return message.util.send(embed);
  }

  public defaultHelp (message: Message, pub = false) {
    const embed = this.util.embed(message)
      .setColor(0xFF00AE)
      .setTitle('Commands')
      .setDescription([
        message.guild ? `This server's prefix is \`${(this.handler.prefix as PrefixSupplier)(message)}\`` : '',
        'For more info about a command, see: `help [command name]`',
        'For an in-depth guide on how to use this bot, see: `guide`',
      ]);

    for (const [ category, commands ] of this.handler.categories) {
      const title = {
        admin: 'Server Manager',
        general: 'General',
        kamihime: 'Kamihime',
        countdown: 'Kamihime - Countdown',
        tag: 'Tag System',
        util: 'Utilities'
      }[category];

      if (
        (!message.guild && category === 'admin') || (
            message.guild && category === 'admin' &&
            !(message.channel as TextChannel).permissionsFor(message.member).has('MANAGE_GUILD')
          )
      ) continue;

      const publicCommands = message.author.id === this.client.ownerID && !pub
        ? commands
        : commands.filter(c => !c.ownerOnly);
      const parentCommands = publicCommands.filter(c => Boolean(c.aliases && c.aliases.length));

      if (title) embed.addField(title, parentCommands.map(c => `\`${c.aliases[0]}\``).join(', '));
    }

    return message.util.send(embed);
  }
}
