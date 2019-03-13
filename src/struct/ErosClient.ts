import IErosClientOptions from 'auth';
import { AkairoClient, InhibitorHandler, ListenerHandler } from 'discord-akairo';
import { Message } from 'discord.js';
import * as Fandom from 'nodemw';
import { promisify } from 'util';
import GuideCommand from '../commands/general/guide';
import ErosError from '../struct/ErosError';
import { create } from '../struct/models';
import Winston from '../util/console';
import Command from './command';
import ErosCommandHandler from './command/commandHandler';
import CommandHandlerResolverTypes from './command/resolverTypes';
import Selection from './util/Selection';

const db = create();
const productionMode = process.env.NODE_ENV === 'production';

export default class ErosClient extends AkairoClient {
  constructor (config: IErosClientOptions) {
    super({ ownerID: config.ownerID }, {
      disabledEvents: [
        'TYPING_START',
        'CHANNEL_PINS_UPDATE',
        'GUILD_BAN_ADD',
        'GUILD_BAN_REMOVE',
        'MESSAGE_DELETE',
        'RESUMED',
        'VOICE_SERVER_UPDATE',
        'VOICE_STATE_UPDATE',
        'WEBHOOKS_UPDATE',
      ],
      disableEveryone: true,
      messageCacheLifetime: 300,
      messageCacheMaxSize: 50,
      restTimeOffset: productionMode ? 500 : 1000
    });

    this.config = config;

    this.util.selection = new Selection(this);

    this.commandHandler.resolver.addTypes(new CommandHandlerResolverTypes(this).distribute());
  }

  public commandHandler = new ErosCommandHandler(this, {
    allowMention: true,
    automateCategories: true,
    classToHandle: Command,
    commandUtil: true,
    commandUtilLifetime: 1000 * 60 * 3,
    defaultCooldown: 5000,
    defaultPrompt: {
      cancel: (msg: Message) => `${msg.author}, command cancelled.`,
      ended: (msg: Message) => `${msg.author}, command declined.`,
      modifyRetry: (text, msg) => text && `${msg.author}, ${text}\n\nType \`cancel\` to cancel this command.`,
      modifyStart: (text, msg) => text && `${msg.author}, ${text}\n\nType \`cancel\` to cancel this command.`,
      retries: 3,
      time: 30000,
      timeout: (msg: Message) => `${msg.author}, command expired.`
    },
    directory: `${__dirname}/../commands`,
    prefix: async message => {
      if (!message.guild) return '';

      const [ guild ] = await this.db.Guild.findOrCreate({
        where: { id: message.guild.id },
        attributes: [ 'prefix' ],
        defaults: {
          prefix: this.config.defaultPrefix,
          id: message.guild.id,
          owner: message.guild.ownerID
        }
      });

      return guild.prefix;
    }
  });

  public inhibitorHandler = new InhibitorHandler(this, {
    automateCategories: true,
    directory: `${__dirname}/../inhibitors`
  });

  public listenerHandler = new ListenerHandler(this, {
    automateCategories: true,
    directory: `${__dirname}/../listeners`
  });

  public logger = new Winston().logger;

  public ErosError = ErosError;

  public build () {
    this.commandHandler
      .useInhibitorHandler(this.inhibitorHandler)
      .useListenerHandler(this.listenerHandler);

    this.listenerHandler.setEmitters({
      commandHandler: this.commandHandler,
      inhibitorHandler: this.inhibitorHandler,
      listenerHandler: this.listenerHandler
    });

    this.listenerHandler.loadAll();
    this.commandHandler.loadAll();
    this.inhibitorHandler.loadAll();

    return this;
  }

  public async init () {
    if (process.argv.includes('--parseDocs')) {
      this.logger.info('Docs Parsing Mode Engaged');

      const docs = this.commandHandler.modules.get('guide') as GuideCommand;

      return docs.parseDialogs();
    }

    const force = [ '-f', '--force' ].some(f => process.argv.includes(f));

    if (force) this.logger.info('Forced sync detected.');

    await db.sequelize.sync({ force });
    this.logger.info('Database synchronised!');

    this.fandomApi = new Fandom({
      debug: false,
      path: '',
      protocol: 'https',
      server: 'kamihime-project.fandom.com'
    });
    this.util.getArticle = promisify(this.fandomApi.getArticle.bind(this.fandomApi));
    this.logger.info(`Initiated Fandom Server: ${this.fandomApi.protocol} | ${this.fandomApi.server}`);

    return this.login(this.config.token);
  }

  get db () {
    return db;
  }
}
