import { Listener } from 'discord-akairo';
import CountdownScheduler from '../../functions/CountdownScheduler';
import Twitter from '../../functions/Twitter';

export default class extends Listener {
  constructor () {
    super('ready', {
      emitter: 'client',
      event: 'ready'
    });
  }

  public exec () {
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

      if (this.client.scheduler) this.client.scheduler.destroy('this');
      if (this.client.twitter) this.client.twitter.destroy();

      this.client.scheduler = new CountdownScheduler(this.client);
      this.client.twitter = new Twitter(this.client);

      this.client.scheduler
        .on('add', (date, name) => this.client.scheduler.add(date, name))
        .on('delete', (date, name) => this.client.scheduler.delete(date, name));

      return this.client.twitter.init();
    } catch (err) {
      this.client.logger.error(err);
    }
  }
}
