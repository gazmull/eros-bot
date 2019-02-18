import ErosCommand from '../../struct/command';
import CountdownCommand from './countdown';

export default class extends ErosCommand {
  constructor () {
    super('countdown-delete', {
      description: {
        content: 'Deletes a countdown.',
        usage: '<countdown name>',
        examples: [ 'A User\'s Birthday' ]
      },
      ratelimit: 2,
      args: [
        {
          id: 'countdown',
          type: 'countdown',
          match: 'rest',
          prompt: {
            start: 'what countdown should be deleted?',
            retry: (_, __, input: { phrase: string }) =>
              ` **${input.phrase}** does not exist. Please provide again.`
          }
        },
      ]
    });
  }

  public async exec (message: Message, { countdown: { name, date } }: { countdown: { name: string, date: number } }) {
    const parent = this.handler.modules.get('countdown') as CountdownCommand;
    const found = parent.countdowns.findKey(el => el.includes(name));

    if (!found) return message.util.reply(`countdown named \`${name}\` not found.`);

    parent.countdowns.delete(found);
    await parent.save();

    this.client.scheduler.emit('delete', date, name);

    return message.util.reply(`\`${name}\` countdown removed!`);
  }
}
