import { Listener } from 'discord-akairo';
import { Message, TextChannel } from 'discord.js';
import InsultCommand from '../../commands/fun/insult';

export default class extends Listener {
  constructor () {
    super('messageInvalid', {
      emitter: 'commandHandler',
      event: 'messageInvalid'
    });
  }

  public async exec (message: Message) {
    const parsed = message.util.parsed;

    if (!message.guild) return;
    if (!parsed.prefix) {
      await this.validateExp(message);
      await this.validateStalk(message);

      return;
    }

    if (!parsed.afterPrefix) return;

    const commandHandler = this.client.commandHandler;
    const command = commandHandler.modules.get('tag-show');
    const args = await command.parse(message, parsed.afterPrefix);

    return commandHandler.runCommand(message, command, args);
  }

  protected async validateExp (message: Message) {
    if (message.content.length <= 3) return;

    const [ member ] = await this.client.db.Level.findOrCreate({
      where: {
        user: message.author.id,
        guild: message.guild.id
      }
    });

    const eligible = Date.now() > (new Date(member.updatedAt).getTime() + 10e3);
    const exp = Math.floor(Math.random() * 10);

    if (eligible) {
      await member.increment('exp', { by: exp });

      const newTitle = await this.client.db.Title.findOne({
        where: { threshold: { [ this.client.db.Op.lte ]: member.exp } },
        order: [ [ 'threshold', 'DESC' ] ],
        attributes: [ 'id' ]
      });

      if (newTitle.id !== member.title) await member.update({ title: newTitle.id });
    }

    return true;
  }

  protected validateStalk (message: Message) {
    const Insult = this.client.commandHandler.modules.get('insult') as InsultCommand;
    const channel = message.channel as TextChannel;

    if (Insult.stalks.includes(message.author.id) && channel.permissionsFor(message.guild.me).has('SEND_MESSAGES'))
      return message.util.send(`${message.member}: ${Insult.randomMessage}`);
  }
}
