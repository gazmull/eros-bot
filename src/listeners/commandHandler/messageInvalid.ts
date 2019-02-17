import { Listener } from 'discord-akairo';
import { Op } from 'sequelize';
import ErosClient from '../../struct/ErosClient';

export default class extends Listener {
  constructor () {
    super('messageInvalid', {
      emitter: 'commandHandler',
      event: 'messageInvalid'
    });
  }

  public async exec (message: Message) {
    const parsed = message.util.parsed;
    const client = this.client as ErosClient;

    if (!message.guild) return;
    if (!parsed) return;
    if (!parsed.prefix || !parsed.afterPrefix || !parsed.alias) {
      if (message.content.length <= 3) return;

      const res = await client.db.Level.findOrCreate({
        where: {
          user: message.author.id,
          guild: message.guild.id
        },
        attributes: [ 'id', 'exp', 'title', 'updatedAt' ]
      });

      if (!res[0]) return;

      const [ member ] = res;
      const eligible = Date.now() > (new Date(member.updatedAt).getTime() + 10e3);
      const exp = Math.floor(Math.random() * 10);

      if (eligible) {
        await member.increment('exp', { by: exp });

        const newTitle = await client.db.Title.findOne({
          where: { threshold: { [ Op.lte ]: member.exp } },
          order: [ [ 'threshold', 'DESC' ] ],
          attributes: [ 'id' ]
        });

        if (newTitle.id !== member.title) await member.update({ title: newTitle.id });
      }

      return;
    }

    const commandHandler = client.commandHandler;
    const command = commandHandler.modules.get('tag-show');
    const args = await command.parse(message, message.util.parsed.afterPrefix);

    return commandHandler.runCommand(message, command, args);
  }
}
