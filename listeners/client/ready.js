const { Listener } = require('discord-akairo');
const { status, error } = require('../../utils/console');
const { promisify } = require('util');

// const Twitter = require('../../functions/Twitter');
// const CountdownScheduler = require('../../functions/CountdownScheduler');

class ReadyListener extends Listener {
  constructor() {
    super('ready', {
      emitter: 'client',
      event: 'ready'
    });
  }

  exec() {
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

      const { client } = this;

      client.getArticle = promisify(this.client.request.getArticle.bind(this.client.request));
      client.getArticleCategories = promisify(this.client.request.getArticleCategories.bind(this.client.request));
      client.getImageInfo = promisify(this.client.request.getImageInfo.bind(this.client.request));

      // client.scheduler = new CountdownScheduler(client);

      // client.scheduler.init();
      // Twitter.init(client);
    } catch (err) {
      error(err);
    }
  }
}

module.exports = ReadyListener;
