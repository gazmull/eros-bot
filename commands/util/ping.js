const { Command } = require('discord-akairo');

class PingCommand extends Command {
  constructor() {
    super('ping', {
      aliases: ['ping', 'pong', 'trace'],
      description: {
        content: 'Checks the bot\'s status.'
      }
    });
  }

  async exec(message) {
    try {
      const sentMessage = await message.channel.send('Requesting...');
      const estimatedPing = sentMessage.createdTimestamp - message.createdTimestamp;
      const roundInt = Math.round((estimatedPing) / 50);
      return sentMessage.edit(`Po${'o'.repeat(roundInt)}ng!\n\n:arrows_counterclockwise: ${estimatedPing}ms\n:heart: ${Math.round(this.client.ping)}ms`);
    }
    catch (err) { console.log(err); }
  }
}

module.exports = PingCommand;