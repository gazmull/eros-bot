import { Listener } from 'discord-akairo';
import CountdownScheduler from '../../functions/CountdownScheduler';
import Twitter from '../../functions/Twitter';
import ErosClient from '../../struct/ErosClient';
import { error, status } from '../../util/console';

export default class extends Listener {
  constructor () {
    super('ready', {
      emitter: 'client',
      event: 'ready'
    });
  }

  public exec () {
    try {
      const client = this.client as ErosClient;
      const me = client.user;
      const guildSize = client.guilds.size;

      status(`Logged in as ${me.tag} (ID: ${me.id})`);
      me.setActivity(`@${me.username} help`, { type: 'LISTENING' });

      if (guildSize)
        status(`Listening to ${guildSize === 1
          ? client.guilds.first()
          : `${guildSize} Guilds`}`);
      else status('Standby Mode');

      client.scheduler = new CountdownScheduler(client);

      client.scheduler
        .on('add', (date, name) => client.scheduler.add(date, name))
        .on('delete', (date, name) => client.scheduler.delete(date, name));

      return new Twitter(client).init();
    } catch (err) {
      error(err);
    }
  }
}
