import { Command as AkairoCommand, CommandOptions } from 'discord-akairo';
import GuideCommand from '../../commands/general/guide';
import ErosClient from '../ErosClient';
import ErosCommandHandler from './commandHandler';

export default class ErosCommand extends AkairoCommand {
  constructor (id: string, options: ICommandOptions) {
    super(id, options);

    this.noTrash = options.noTrash || false;
  }

  public client: ErosClient;

  public handler: ErosCommandHandler;

  public noTrash: boolean;

  get guidePage () {
    const page = (this.handler.modules.get('guide') as GuideCommand)
      .formattedCommandDialogs[this.id];

    return page;
  }
}

export interface ICommandOptions extends CommandOptions {
  description: {
    content: string | string[];
    usage?: string;
    examples?: string[];
    [key: string]: any;
  };
  noTrash?: boolean;
  shouldAwait?: boolean;
}
