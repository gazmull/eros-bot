import ErosCommand from '../../struct/command';
import ErosListener from '../../struct/listener';

export default class extends ErosListener {
  constructor () {
    super('commandLoad', {
      emitter: 'commandHandler',
      event: 'load'
    });
  }

  public exec (command: ErosCommand) {
    const perms = [ 'SEND_MESSAGES', 'MANAGE_MESSAGES', 'ADD_REACTIONS', 'EMBED_LINKS' ];
    const cp = command.clientPermissions as string[];

    if (cp)
      Object.assign(command, { clientPermissions: cp.concat(perms) });
    else
      Object.assign(command, { clientPermissions: perms });
  }
}
