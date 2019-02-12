import { Listener } from 'discord-akairo';
import Twitter from '../../functions/Twitter';
import ErosClient from '../../struct/ErosClient';
import { error, status } from '../../util/console';
// import * as CountdownScheduler from '../../functions/CountdownScheduler';

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

      // client.scheduler = new CountdownScheduler(client);
      // client.scheduler.init();
      return new Twitter(client).init();
    } catch (err) {
      error(err);
    }
  }
}
