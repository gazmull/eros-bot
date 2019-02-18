import ErosCommand from '../../struct/command';

export default class extends ErosCommand {
  constructor () {
    super('set-loli', {
      description: { content: 'Changes this server\'s Loli restriction condition. Toggle-able command.' }
    });
  }

  public async exec (message: Message) {
    const loli = this.client.guildSettings.get(message.guild.id, 'loli', false);
    await this.client.guildSettings.set(message.guild.id, 'loli', !loli);

    return message.util.reply(
      loli
        ? 'I have disabled Loli contents restriction in this server.'
        : 'I have enabled Loli contents restriction in this server.'
    );
  }
}
