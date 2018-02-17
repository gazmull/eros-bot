const { Command } = require('discord-akairo');
const PaginationEmbed = require('../../utils/PaginationEmbed');

class GuideCommand extends Command {
  constructor() {
    super('guide', {
      aliases: ['guide'],
      description: { content: 'Displays a guide for Kamihime commands.' },
      clientPermissions: ['ADD_REACTIONS', 'MANAGE_MESSAGES', 'EMBED_LINKS'],
    });
    this.paginated = true;
  }

  exec(message) {
    const embed = new PaginationEmbed(message)
      .setArray(['howdy', 'how are you', 'hey', 'mah bruddah can u show me de wae'])
      .setElementsPerPage(1)
      .setColor(0xFF00AE)
      .formatField('Guide', i => i, false);
    
    return embed.build();
  }
}

module.exports = GuideCommand;