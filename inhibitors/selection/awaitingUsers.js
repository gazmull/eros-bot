const { Inhibitor } = require('discord-akairo');

class AwaitingUsersInhibitor extends Inhibitor {
  constructor() {
    super('awaitingUsers', { reason: 'you have an existing awaiting command. If you wish to continue with a new command, please say `cancel`.' });
  }

  exec(message) {
    const isAwaiting = this.client.util.selection.users.get(message.author.id);
    const shouldAwait = message.util.command && message.util.command.shouldAwait;

    return isAwaiting && shouldAwait;
  }
}

module.exports = AwaitingUsersInhibitor;
