import { Message } from 'discord.js';
import Command from '../../struct/command';

export default class extends Command {
  constructor () {
    super('ping', {
      aliases: [ 'ping', 'pong', 'trace' ],
      description: { content: 'Checks my status.' }
    });
  }

  public async exec (message: Message) {
    try {
      await message.util.send('Requesting...');
      const estimatedPing = message.util.lastResponse.createdTimestamp - message.createdTimestamp;
      const roundInt = Math.round((estimatedPing) / 50);

      return message.util.edit([
        `Po${'o'.repeat(roundInt)}ng!`,
        `\n:arrows_counterclockwise: ${estimatedPing}ms`,
        `:heart: ${Math.round(this.client.ws.ping)}ms`,
      ]);
    } catch (err) { this.client.logger.error(err); }
  }
}
