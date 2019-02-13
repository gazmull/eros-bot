import ErosCommand from '../../struct/command';
import ErosClient from '../../struct/ErosClient';

export default class extends ErosCommand {
  constructor () {
    super('loli', {
      aliases: [ 'loli' ],
      description: { content: '**Toggle-able**\nChanges this guild\'s Loli restriction condition.' },
      userPermissions: [ 'MANAGE_GUILD' ],
      channel: 'guild'
    });
  }

  public async exec (message: Message) {
    const client = this.client as ErosClient;
    const loli = client.guildSettings.get(message.guild.id, 'loli', false);
    await client.guildSettings.set(message.guild.id, 'loli', !loli);

    return message.util.reply(
      loli
        ? 'I have disabled Loli contents restriction in this guild.'
        : 'I have enabled Loli contents restriction in this guild.'
    );
  }
}
