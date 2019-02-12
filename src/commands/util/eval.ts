import * as util from 'util';
import Command from '../../struct/command';
import { evalStatus } from '../../util/console';

function clean (text) {
  if (typeof text === 'string')
    return text.replace(/`/g, `\`${String.fromCharCode(8203)}`).replace(/@/g, `@${String.fromCharCode(8203)}`);

  return text;
}

export default class extends Command {
  constructor () {
    super('eval', {
      aliases: [ 'eval', 'ev', 'e' ],
      description: { content: 'Evaluates text from agument.' },
      ownerOnly: true,
      args: [
        {
          id: 'code',
          match: 'text'
        },
      ]
    });
  }

  public async exec (message: Message, { code }: { code: string }) {
    evalStatus(`${message.author.tag} (${message.author.id}) Triggered eval. Did you do this?`);
    try {
      let evaled = eval(code); // tslint:disable-line:no-eval

      if (evaled instanceof Promise) evaled = await evaled;
      if (typeof evaled !== 'string') evaled = util.inspect(evaled);
      if (evaled.length >= 2000) evaled = `${evaled.slice(0, 1900)}...`;

      return message.channel.send(`**OUTPUT**\`\`\`xl\n${clean(evaled).includes('.token')
        ? 'MzgwMjAy0WtgddsOpz5T0o3.H3hPzW10.GQSphbR34sdkIoep-iw4dcz9n4F'
        : clean(evaled)}\n\`\`\``);
    } catch (err) {
      return message.channel.send(`**ERROR**\`\`\`xl\n${clean(err)}\n\`\`\``);
    }
  }
}
