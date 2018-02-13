const { Command } = require('discord-akairo');

class ToggleLoliCommand extends Command {
  constructor() {
    super('loli', {
      aliases: ['loli'],
      description: {
        content: '**Toggle-able**\nChanges this guild\'s Loli restriction condition.'
      },
      userPermissions: ['MANAGE_GUILD'],
      channel: 'guild',
    })
  }

  async exec(message) {
    const loli = this.client.guildSettings.get(message.guild.id, 'loli', false);
    await this.client.guildSettings.set(message.guild.id, 'loli', loli ? false : true);
    return message.util.reply(
      loli
        ? 'I have disabled Loli contents restriction in this guild.'
        : 'I have enabled Loli contents restriction in this guild.'
    );
  }
}

module.exports = ToggleLoliCommand;