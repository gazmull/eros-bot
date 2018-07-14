const { Listener } = require('discord-akairo');

class CommandLoadListener extends Listener {
  constructor() {
    super('commandLoad', {
      emitter: 'commandHandler',
      event: 'load'
    });
  }

  exec(command) {
    const perms = ['SEND_MESSAGES', 'MANAGE_MESSAGES', 'ADD_REACTIONS', 'EMBED_LINKS'];
    const cp = command.clientPermissions;

    if (cp)
      command.clientPermissions = cp.concat(perms);
    else
      Object.assign(command, { clientPermissions: perms });
  }
}

module.exports = CommandLoadListener;
