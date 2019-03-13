import { Message, TextChannel } from 'discord.js';
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

  public async exec (message: Message, { command, pub }: { command: ErosCommand, pub: boolean }) {
    const prefix = await this.handler.prefix(message);
    if (!command) return this.defaultHelp(message, pub);

    const clientPermissions = command.clientPermissions as string[];
    const userPermissions = command.userPermissions as string[];
    const examples: string[] = command.description.examples;
    const guidePage = command.guidePage;

    const embed = this.util.embed(message)
      .setTitle(`${prefix}${command} ${command.description.usage ? command.description.usage : ''}`)
      .setDescription(command.description.content);

    if (clientPermissions)
      embed.addField('Required Bot Permissions', clientPermissions.map(p => `\`${toTitleCase(p)}\``).join(', '));
    if (userPermissions)
      embed.addField('Required User Permissions:', userPermissions.map(p => `\`${toTitleCase(p)}\``).join(', '));
    if (command.aliases.length > 1)
      embed.addField('Aliases', command.aliases.slice(1).map(a => `\`${a}\``).join(', '));
    if (examples)
      embed.addField('Examples', examples.map(e => `${prefix}${command} ${e}`).join('\n'));
    if (guidePage)
      embed.addField('Guide Page', `To see more description of this command: \`${prefix}guide ${guidePage}\``);

    return message.util.send(embed);
  }

  public async defaultHelp (message: Message, pub = false) {
    const prefix = await this.handler.prefix(message);
    const embed = this.util.embed(message)
      .setColor(0xFF00AE)
      .setTitle('Commands')
      .setDescription([
        message.guild ? `This server's prefix is \`${prefix}\`` : '',
        `For more info about a command, see: \`${prefix}help [command name]\``,
        `For an in-depth guide on how to use this bot, see: \`${prefix}guide\``,
        !message.guild
          // tslint:disable-next-line:prefer-template
          ? '\nThere are commands that are only usable in servers.' +
            ' If you would like to see them, please trigger this command in a server.'
          : '',
      ]);

    for (const [ category, commands ] of this.handler.categories) {
      const title = {
        set: 'Server Settings',
        general: 'General',
        kamihime: 'Kamihime',
        countdown: 'Kamihime - Countdown',
        tag: 'Tag System',
        fun: 'For teh Lulz',
        level: 'Leveling System',
        util: 'Utilities'
      }[category];

      if (
        (!message.guild && category === 'set') || (
            message.guild && category === 'set' &&
            !(message.channel as TextChannel).permissionsFor(message.member).has('MANAGE_GUILD')
          )
      ) continue;

      const publicCommands = message.author.id === this.client.ownerID && !pub
        ? commands
        : commands.filter(c => !c.ownerOnly);
      let parentCommands = publicCommands.filter(c => Boolean(c.aliases && c.aliases.length));

      if (!message.guild) parentCommands = parentCommands.filter(c => c.channel !== 'guild');
      if (title && parentCommands.size)
        embed.addField(title, parentCommands.map(c => `\`${c.aliases[0]}\``).join(', '));
    }

    embed.fields = embed.fields.sort((a, b) => a.name > b.name ? 1 : (a.name < b.name ? -1 : 0));

    return message.util.send(embed);
  }
}
