// tslint:disable-next-line:max-line-length
import { AkairoClient, CommandHandler, InhibitorHandler, ListenerHandler, SequelizeProvider } from 'discord-akairo';
import { Util } from 'discord.js';
import * as Fandom from 'nodemw';
import { promisify } from 'util';
// @ts-ignore
import { defaultPrefix } from '../../auth';
import ErosError from '../struct/ErosError';
import { create } from '../struct/models';
import { status } from '../util/console';
import Command from './command';
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

        return this.guildSettings.get(message.guild.id, 'prefix', defaultPrefix);
      }
    });

    this.commandHandler.resolver.addType('existingTag', async (name, message) => {
      if (!name) return null;

      name = Util.cleanContent(name.toLowerCase(), message);
      const tag = await this.db.Tag.findOne({
        where: {
          name,
          guildId: message.guild.id
        }
      });

      if (tag || name.length > 256) return null;

      return name;
    });

    this.commandHandler.resolver.addType('tag', async (name, message) => {
      if (!name) return null;

      name = Util.cleanContent(name.toLowerCase(), message);
      const tag = await this.db.Tag.findOne({
        where: {
          name,
          guildId: message.guild.id
        }
      });

      return tag || null;
    });

    this.commandHandler.resolver.addType('tagContent', (content, message) => {
      if (!content || content.length > 1950) return null;

      content = Util.cleanContent(content, message);

      return content;
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

    this.fandomApi = this._fandomApi;

    this.ErosError = ErosError;

    this.util.selection = new Selection(this);
  }

  public commandHandler: CommandHandler;
  public inhibitorHandler: InhibitorHandler;
  public listenerHandler: ListenerHandler;
  public config: any;
  public guildSettings: SequelizeProvider;
  public tagSettings: SequelizeProvider;
  public fandomApi: Fandom;
  public ErosError = ErosError;
  public util: IClientUtil;

  get _fandomApi () {
    return this.fandomApi;
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

    await db.Tag.sync();
    status('Tags Settings Database synchronised!');

    await this.guildSettings.init();
    status('Provider set!');

    this.fandomApi = new Fandom({
      debug: false,
      path: '',
      protocol: 'https',
      server: 'kamihime-project.fandom.com'
    });
    this.util.getArticle = promisify(this.fandomApi.getArticle.bind(this._fandomApi));
    this.util.getArticleCategories = promisify(this.fandomApi.getArticleCategories.bind(this._fandomApi));
    status(`Initiated Fandom Server: ${this.fandomApi.protocol} | ${this.fandomApi.server}`);

    return this.login(this.config.token);
  }

  get db () {
    return db;
  }
}
