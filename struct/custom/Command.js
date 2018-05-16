const { Command: AkairoCommand } = require('discord-akairo');

class Command extends AkairoCommand {
  constructor(id, options = {}) {
    super(id, options);

    this.shouldAwait = options.shouldAwait || false;
    this.paginated = options.paginated || false;
  }
}

module.exports = Command;
