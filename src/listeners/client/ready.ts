import { Listener } from 'discord-akairo';
import GuideCommand from '../../commands/general/guide';
import GlossaryCommand from '../../commands/kamihime/glossary';
import CountdownScheduler from '../../functions/CountdownScheduler';
import Twitter from '../../functions/Twitter';

export default class extends Listener {
  constructor () {
    super('ready', {
      emitter: 'client',
      event: 'ready'
    });
  }

  public async exec () {
    try {
      const me = this.client.user;
      const guildSize = this.client.guilds.size;

      this.client.logger.info(`Logged in as ${me.tag} (ID: ${me.id})`);
      me.setActivity(`@${me.username} help`, { type: 'LISTENING' });

      if (guildSize)
        this.client.logger.info(`Listening to ${guildSize === 1
          ? this.client.guilds.first()
          : `${guildSize} Guilds`}`);
      else this.client.logger.info('Standby Mode');

      // if (this.client.scheduler) {
      //   this.client.commandHandler.reload('countdown');
      //   this.client.scheduler.destroy('this');
      // }
      if (this.client.twitter) this.client.twitter.destroy();

      // this.client.scheduler = new CountdownScheduler(this.client);
      this.client.twitter = new Twitter(this.client);

      // this.client.scheduler
      //   .on('add', (date, name) => this.client.scheduler.add(date, name))
      //   .on('delete', (date, name) => this.client.scheduler.delete(date, name));
      this.client.twitter.init();

      const glossaryCommnad = this.client.commandHandler.modules.get('glossary') as GlossaryCommand;
      const guideCommand = this.client.commandHandler.modules.get('guide') as GuideCommand;

      await glossaryCommnad.initGlossary();

      return guideCommand.init.call(guideCommand);
    } catch (err) {
      return this.client.logger.error(err);
    }
  }
}
