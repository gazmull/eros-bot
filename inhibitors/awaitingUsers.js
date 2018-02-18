const { Inhibitor } = require('discord-akairo');

class AwaitingUsersInhibitor extends Inhibitor {
  constructor() {
    super('awaitingUsers', {
      reason: 'currently awaiting the user\'s respond from a menu selection command.'
    });
  }
  exec(message) {
    const checkAwaiting = this.client.awaitingUsers.get(message.author.id);
    const isCommandInfo = message.util.command && (message.util.command.id === 'info' || message.util.command.id === 'hinfo');
    
    if(checkAwaiting && isCommandInfo) {
      message.reply('you have an existing awaiting command. If you wish to continue with a new command, please say `cancel`.');
      return true;
    }
    else return false;
  }
}

module.exports = AwaitingUsersInhibitor;