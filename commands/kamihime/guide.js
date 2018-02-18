const { Command } = require('discord-akairo');
const PaginationEmbed = require('../../utils/PaginationEmbed');

const { loading } = require('../../auth').emojis;

class GuideCommand extends Command {
  constructor() {
    super('guide', {
      aliases: ['guide'],
      description: { content: 'Displays a guide for Kamihime commands.' },
      clientPermissions: ['ADD_REACTIONS', 'MANAGE_MESSAGES', 'EMBED_LINKS'],
    });
    this.paginated = true;
    this.dialogs = [
      'this is a test',
      'how are you',
      'hey',
      'mah bruddah can u show me de wae'
    ]
  }

  async exec(message) {
    try {
      const embed = new PaginationEmbed()
        .setAuthorisedUser(message.author)
        .setChannel(message.channel)
        .setClientMessage(null, `${loading} Preparing...`)
        .setArray(this.dialogs)
        .setElementsPerPage(1)
        .showPageIndicator(false)
        .setColor(0xFF00AE)
        .formatField('Guide', i => i, false);
      
      return await embed.build();
   }
    catch (err) {
      message.reply(`I cannot complete the query because:\`\`\`x1\n${err}\`\`\``);
    }
  }
}

module.exports = GuideCommand;