import { Argument } from 'discord-akairo';
import { Message, TextChannel } from 'discord.js';
import Command from '../../struct/command';

export default class extends Command {
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
          type: Argument.union('commandAlias', 'command')
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

  public condition (message: Message) {
    return new RegExp(`^<@!?${this.client.user.id}>`).test(message.content);
  }

  public async exec (message: Message, { command, pub }: { command: Command, pub: boolean }) {
    if (!command) return this.defaultHelp(message, pub);

    return message.util.send(command.guidePage);
  }

  public async defaultHelp (message: Message, pub = false) {
    const prefix = await this.handler.prefix(message);
    const embed = this.client.embed(message)
      .setColor(0xFF00AE)
      .setTitle('Commands')
      .setDescription([
        message.guild ? `This server's prefix is \`${prefix}\`` : '',
        `For more info about a command, see: \`${prefix}help <command name>\``,
        `For a guide on how to set up this bot, see: \`${prefix}guide\``,
        `To view the full documentation, see: ${this.client.config.docs}`,
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
