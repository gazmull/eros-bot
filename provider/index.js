const { status } = require('../utils/console');

const { AkairoClient, SequelizeProvider } = require('discord-akairo');
const { Collection } = require('discord.js');
const wikia = require('nodemw');

const { defaultPrefix } = require('../auth');
const defineGuild = require('./models/guild');
// const defineKH = require('./models/kamihime');

class ErosClient extends AkairoClient {
  constructor(config) {
    super({
      ownerID: config.ownerID,
      prefix: message => {
        if (!message.guild) return '';

        return this.guildSettings.get(message.guild.id, 'prefix', defaultPrefix);
      },
      allowMention: true,
      automateCategories: true,
      commandUtil: true,
      commandUtilLifetime: 1000 * 60 * 3,
      commandDirectory: `${__dirname}/../commands`,
      listenerDirectory: `${__dirname}/../listeners`,
      inhibitorDirectory: `${__dirname}/../inhibitors`,
      defaultPrompt: {
        modifyStart: (text, msg) => text && `${msg.author}, ${text}\n\nType \`cancel\` to cancel this command.`,
        modifyRetry: (text, msg) => text && `${msg.author}, ${text}\n\nType \`cancel\` to cancel this command.`,
        timeout: msg => `${msg.author}, command expired.`,
        ended: msg => `${msg.author}, command declined.`,
        cancel: msg => `${msg.author}, command cancelled.`,
        retries: 3,
        time: 30000
      }
    }, {
      disableEveryone: true,
      disabledEvents: ['TYPING_START']
    });

    this.config = config;
    this.guildSettings = new SequelizeProvider(defineGuild, { idColumn: 'id' });
    // this.khDB = new SequelizeProvider(defineKH, { idColumn: 'khID' });
    this.awaitingUsers = new Collection();
    this.request = null;
  }

  async init() {
    await defineGuild.sync();
    status('Guild Settings Database synchronised!');
    // await defineKH.sync();
    // status('Kamihime Database synchronised!');
    await this.guildSettings.init();
    status('Provider set!');
    this.request = new wikia({
      protocol: 'https',
      server: 'kamihime-project.wikia.com',
      path: '',
      debug: false
    });
    status(`Initiated Wikia Server: ${this.request.protocol} | ${this.request.server}`);

    return this.login(this.config.TOKEN);
  }
}

module.exports = ErosClient;