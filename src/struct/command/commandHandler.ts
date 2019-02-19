import { Category, CommandHandler, CommandHandlerOptions, PrefixSupplier } from 'discord-akairo';
import { Collection } from 'discord.js';
import ErosCommand from '../command';
import ErosClient from '../ErosClient';

export default class ErosCommandHandler extends CommandHandler {
  constructor (client: ErosClient, options: CommandHandlerOptions) {
    super(client, options);
  }

  public categories: Collection<string, Category<string, ErosCommand>>;

  public modules: Collection<string, ErosCommand>;

  public prefix: PrefixSupplier;

  public findCategory (name: string) {
    return super.findCategory(name) as Category<string, ErosCommand>;
  }

  public findCommand (name: string) {
    return super.findCommand(name) as ErosCommand;
  }
}
