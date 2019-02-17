import { Command, CommandOptions } from 'discord-akairo';
import { Embeds, FieldsEmbed } from 'discord-paginationembed';
import { MessageEmbed } from 'discord.js';
import GuideCommand from '../../commands/general/guide';

export default class ErosCommand extends Command {
  constructor (id: string, options: ICommandOptions) {
    super(id, options);

    this.noTrash = options.noTrash || false;
  }

  public noTrash: boolean;

  public util: IUtil = {
    embed: this.embed,
    embeds: this.embeds,
    fields: this.fields
  };

  public embed (message: Message = null) {
    const instance = new MessageEmbed()
      .setColor(0xFF00ae);

    if (message)
      instance
        .setFooter(`Executed by: ${message.author.tag} (${message.author.id})`)
        .setTimestamp(new Date());

    return instance;
  }

  public embeds (message: Message = null) {
    const instance = new Embeds()
      .setColor(0xFF00AE);

    if (message)
      instance
        .setFooter(`Executed by: ${message.author.tag} (${message.author.id})`)
        .setTimestamp(new Date());

    return instance;
  }

  public fields (message: Message = null) {
    const instance = new FieldsEmbed()
      .setColor(0xFF00AE);

    if (message)
      instance
        .setFooter(`Executed by: ${message.author.tag} (${message.author.id})`)
        .setTimestamp(new Date());

    return instance;
  }

  public emitError (err: Error, message: Message, command?: ErosCommand, step?: number) {
    Object.assign(err, { step });

    return this.handler.emitError(err, message, command);
  }

  public fail (message: Message) {
    return message.react('❌');
  }

  get guidePage () {
    const page = (this.handler.modules.get('guide') as GuideCommand).dialogs
      .findIndex(c => c.command && c.command === this.id);

    return page !== -1 ? page + 2 : null;
  }
}

interface ICommandOptions extends CommandOptions {
  description: {
    content: string | string[];
    usage?: string;
    examples?: string[];
    [key: string]: any;
  };
  noTrash?: boolean;
  shouldAwait?: boolean;
}

interface IUtil {
  embed: (message?: Message) => MessageEmbed;
  embeds: (message?: Message) => Embeds;
  fields: (message?: Message) => FieldsEmbed;
}
