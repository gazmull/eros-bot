import { Category, CommandHandler, CommandHandlerOptions, PrefixSupplier } from 'discord-akairo';
import { Collection, Message } from 'discord.js';
import Command from '../command';
import ErosClient from '../ErosClient';

export default class ErosCommandHandler extends CommandHandler {
  constructor (client: ErosClient, options: CommandHandlerOptions) {
    super(client, options);
  }

  public categories: Collection<string, Category<string, Command>>;

  public modules: Collection<string, Command>;

  public prefix: PrefixSupplier;

  /**
   * @param step - Available Codes
   *     - `0`: Client Error (default)
   *     - `1`: KamihimeDB Request
   *     - `2`: Kamihime Fandom Request
   *     - `3`: Menu Selection
   */
  public emitError (err: Error, message: Message, command?: Command, step = 0) {
    Object.assign(err, { step });

    return super.emitError(err, message, command);
  }

  public reactFail (message: Message) {
    return message.react('❌');
  }

  public findCategory (name: string) {
    return super.findCategory(name) as Category<string, Command>;
  }

  public findCommand (name: string) {
    return super.findCommand(name) as Command;
  }
}
