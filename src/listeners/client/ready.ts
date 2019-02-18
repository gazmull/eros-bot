import CountdownScheduler from '../../functions/CountdownScheduler';
import Twitter from '../../functions/Twitter';
import ErosListener from '../../struct/listener';
import { error, status } from '../../util/console';

export default class extends ErosListener {
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

      status(`Logged in as ${me.tag} (ID: ${me.id})`);
      me.setActivity(`@${me.username} help`, { type: 'LISTENING' });

      if (guildSize)
        status(`Listening to ${guildSize === 1
          ? this.client.guilds.first()
          : `${guildSize} Guilds`}`);
      else status('Standby Mode');

      this.client.scheduler = new CountdownScheduler(this.client);

      this.client.scheduler
        .on('add', (date, name) => this.client.scheduler.add(date, name))
        .on('delete', (date, name) => this.client.scheduler.delete(date, name));

      return new Twitter(this.client).init();
    } catch (err) {
      error(err);
    }
  }
}
