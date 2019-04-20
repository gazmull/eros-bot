import { Listener } from 'discord-akairo';
import Command from '../../struct/command';

export default class extends Listener {
  constructor () {
    super('commandLoad', {
      emitter: 'commandHandler',
      event: 'load'
    });
  }

  public exec (command: Command) {
    const perms = [ 'SEND_MESSAGES', 'MANAGE_MESSAGES', 'ADD_REACTIONS', 'EMBED_LINKS' ];
    const cp = command.clientPermissions as string[];

    if (cp)
      Object.assign(command, { clientPermissions: cp.concat(perms) });
    else
      Object.assign(command, { clientPermissions: perms });
  }
}
