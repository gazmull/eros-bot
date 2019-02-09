// tslint:disable-next-line:max-line-length
import { AkairoClient, CommandHandler, InhibitorHandler, ListenerHandler, SequelizeProvider } from 'discord-akairo';
import * as Wikia from 'nodemw';
import { promisify } from 'util';
// @ts-ignore
import { defaultPrefix } from '../../auth';
import ErosError from '../struct/ErosError';
import { create } from '../struct/models';
import { status } from '../util/console';
import Command from './command/Command';
import Selection from './util/Selection';

const db = create();

export default class ErosClient extends AkairoClient {
  constructor (config) {
    super({ ownerID: config.ownerID }, {
      disabledEvents: [ 'TYPING_START' ],
      disableEveryone: true
    });

    this.commandHandler = new CommandHandler(this, {
      allowMention: true,
      automateCategories: true,
      // @ts-ignore and file an issue for this: it should infer Function? instead of string?
      classToHandle: Command,
      commandUtil: true,
      commandUtilLifetime: 1000 * 60 * 3,
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

        return this.guildSettings.get(message.guild.id, 'prefix', defaultPrefix);
      }
    });

    this.inhibitorHandler = new InhibitorHandler(this, {
      automateCategories: true,
      directory: `${__dirname}/../inhibitors`
    });

    this.listenerHandler = new ListenerHandler(this, {
      automateCategories: true,
      directory: `${__dirname}/../listeners`
    });

    this.config = config;

    this.guildSettings = new SequelizeProvider(db.Guild, { idColumn: 'id' });

    this.wikiApi = this._wikiApi;

    this.ErosError = ErosError;

    this.util.selection = new Selection(this);
  }

  public commandHandler: CommandHandler;
  public inhibitorHandler: InhibitorHandler;
  public listenerHandler: ListenerHandler;
  public config: any;
  public guildSettings: SequelizeProvider;
  public wikiApi: Wikia;
  public ErosError = ErosError;
  public util: IClientUtil;

  get _wikiApi () {
    return this.wikiApi;
  }

  public build () {
    this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
    this.commandHandler.useListenerHandler(this.listenerHandler);
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
    await db.sequelize.sync();
    status('Guild Settings Database synchronised!');
    await this.guildSettings.init();
    status('Provider set!');
    this.wikiApi = new Wikia({
      debug: false,
      path: '',
      protocol: 'https',
      server: 'kamihime-project.fandom.com'
    });
    this.util.getArticle = promisify(this.wikiApi.getArticle.bind(this._wikiApi));
    this.util.getArticleCategories = promisify(this.wikiApi.getArticleCategories.bind(this._wikiApi));
    status(`Initiated Wikia Server: ${this.wikiApi.protocol} | ${this.wikiApi.server}`);

    return this.login(this.config.token);
  }

  get db () {
    return db;
  }
}
