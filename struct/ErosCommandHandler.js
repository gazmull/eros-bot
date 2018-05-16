const { CommandHandler } = require('discord-akairo');
const CustomCommand = require('./custom/Command');

class ErosCommandHandler extends CommandHandler {
  constructor(client, options = {}) {
    super(client, options.commandDirectory, CustomCommand);
  }
}

module.exports = ErosCommandHandler;
