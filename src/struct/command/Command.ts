import { Command, CommandOptions } from 'discord-akairo';
import { Embeds, FieldsEmbed } from 'discord-paginationembed';

export default class ErosCommand extends Command {
  constructor (id: string, options: ICommandOptions) {
    super(id, options);

    this.paginated = options.paginated || false;

    this.util = {
      embeds: this.embeds,
      fields: this.fields
    };
  }

  public paginated: boolean;
  public util: IUtil;

  public embeds (message: Message = null): Embeds {
    const instance = new Embeds()
      .setColor(0xFF00AE);

    if (message)
      instance
        .setFooter(`Executed by: ${message.author.tag} (${message.author.id})`)
        .setTimestamp(new Date());

    return instance;
  }

  public fields (message: Message = null): FieldsEmbed {
    const instance = new FieldsEmbed()
      .setColor(0xFF00AE);

    if (message)
      instance
        .setFooter(`Executed by: ${message.author.tag} (${message.author.id})`)
        .setTimestamp(new Date());

    return instance;
  }

  public emitError (err: Error, message: Message, command: ErosCommand, step: number) {
    Object.assign(err, { step });

    return this.handler.emitError(err, message, command);
  }
}

interface ICommandOptions extends CommandOptions {
  description: {
    content: string;
    usage?: string;
    examples?: string[];
    [key: string]: any;
  };
  paginated?: boolean;
  shouldAwait?: boolean;
}

interface IUtil {
  embeds: Embeds;
  fields: FieldsEmbed;
}
