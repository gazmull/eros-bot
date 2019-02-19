import IErosClientOptions from 'auth';
import { AkairoClient, InhibitorHandler, ListenerHandler, SequelizeProvider } from 'discord-akairo'; // tslint:disable-line:max-line-length
import * as Fandom from 'nodemw';
import { promisify } from 'util';
import GuideCommand from '../commands/general/guide';
import CountdownScheduler from '../functions/CountdownScheduler';
import ErosError from '../struct/ErosError';
import { create } from '../struct/models';
import Logger from '../util/console';
import Command from './command';
import ErosCommandHandler from './command/commandHandler';
import CommandHandlerResolverTypes from './command/resolverTypes';
import ErosListener from './listener';
import Selection from './util/Selection';

const db = create();

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
      messageCacheMaxSize: 50
    });

    this.config = config;

    this.util.selection = new Selection(this);

    this.commandHandler.resolver.addTypes(new CommandHandlerResolverTypes(this).distribute());
  }

  public commandHandler = new ErosCommandHandler(this, {
    allowMention: true,
    automateCategories: true,
    // @ts-ignore and file an issue for this: it should infer Function? instead of string?
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
    prefix: message => {
      if (!message.guild) return '';

      return this.guildSettings.get(message.guild.id, 'prefix', this.config.defaultPrefix);
    }
  });

  public inhibitorHandler = new InhibitorHandler(this, {
    automateCategories: true,
    directory: `${__dirname}/../inhibitors`
  });

  public listenerHandler = new ListenerHandler(this, {
    automateCategories: true,
    // @ts-ignore and file an issue for this: it should infer Function? instead of string?
    classToHandle: ErosListener,
    directory: `${__dirname}/../listeners`
  });

  public config: IErosClientOptions;

  public ownerID: string;

  public guildSettings = new SequelizeProvider(db.Guild, { idColumn: 'id' });

  public fandomApi: Fandom = this._fandomApi;

  public logger = new Logger();

  public scheduler: CountdownScheduler;

  public ErosError = ErosError;

  public util: IClientUtil;

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
    if (this.parseMode) {
      this.logger.status('Docs Parsing Mode Engaged');

      const docs = this.commandHandler.modules.get('guide') as GuideCommand;

      return docs.parseDialogs();
    }

    const force = [ '-f', '--force' ].some(f => process.argv.includes(f));

    if (force) this.logger.status('Forced sync detected.');

    await db.sequelize.sync({ force });
    this.logger.status('Database synchronised!');

    await this.guildSettings.init();
    this.logger.status('Provider set!');

    this.fandomApi = new Fandom({
      debug: false,
      path: '',
      protocol: 'https',
      server: 'kamihime-project.fandom.com'
    });
    this.util.getArticle = promisify(this.fandomApi.getArticle.bind(this._fandomApi));
    this.logger.status(`Initiated Fandom Server: ${this.fandomApi.protocol} | ${this.fandomApi.server}`);

    return this.login(this.config.token);
  }

  get _fandomApi () {
    return this.fandomApi;
  }

  get db () {
    return db;
  }

  get parseMode () {
    return process.argv.includes('--parseDocs');
  }
}
