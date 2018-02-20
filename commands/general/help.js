const { Command } = require('discord-akairo');

class HelpCommand extends Command {
  constructor() {
    super('help', {
      aliases: ['help', 'commands'],
      description: {
        content: 'Displays available commands.',
        usage: '<command name>',
        examples: ['', 'ping', 'info']
      },
      clientPermissions: ['EMBED_LINKS'],
      args: [
        {
          id: 'command',
          type: 'commandAlias'
        }
      ]
    });
  }

  exec(message, { command }) {
    const prefix = this.handler.prefix(message);
    if (!command) return this.defaultHelp(message, prefix);
    const clientPermissions = command.clientPermissions;
    const userPermissions = command.userPermissions;
    const embed = this.client.util.embed()
      .setColor(0xFF00AE)
      .setTitle(`${prefix}${command} ${command.description.usage ? command.description.usage : ''}`)
      .setDescription(`${
        clientPermissions
          ? `**Required Bot Permissions: ${clientPermissions.map(p => `\`${p}\``).join(', ')}**\n`
          : userPermissions
            ? `**Required User Permissions: ${userPermissions.map(p => `\`${p}\``).join(', ')}**\n`
            : ''
      }${command.description.content}`);

    if (command.aliases.length > 1)
      embed.addField('Aliases',
        command.aliases.slice(1).map(a => `\`${a}\``).join(', ')
      );
    if (command.description.examples)
      embed.addField('Examples',
        command.description.examples.map(e => `${prefix}${command} ${e}`).join('\n')
      );

    return message.util.send({ embed });
  }

  defaultHelp(message, prefix) {
    const embed = this.client.util.embed()
      .setColor(0xFF00AE)
      .setTitle('Commands')
      .setDescription(`${message.guild ? `This guild's prefix is \`${prefix}\`\n` : ''}For more info about a command, see: \`help [command]\``);

    for (const category of this.handler.categories.values()) {
      const title = {
        admin: 'Server Manager',
        general: 'General',
        kamihime: 'Kamihime',
        util: 'Utilities'
      }[category.id];

      if (
        (!message.guild && title === 'Server Manager') ||
        (message.guild && !message.channel.permissionsFor(message.member).has('MANAGE_GUILD'))
      ) continue;
      if (title) embed.addField(title, category.map(c => `\`${c.aliases[0]}\``).join(', '));
    }

    return message.util.send({ embed });
  }
}

module.exports = HelpCommand;