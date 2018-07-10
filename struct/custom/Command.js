const { Command: AkairoCommand } = require('discord-akairo');
const PaginationEmbed = require('discord-paginationembed');

class Command extends AkairoCommand {
  constructor(id, options = {}) {
    super(id, options);

    this.shouldAwait = options.shouldAwait || false;

    this.paginated = options.paginated || false;

    this.util = {
      paginationEmbeds: this.paginationEmbeds,
      paginationFields: this.paginationFields
    };
  }

  paginationEmbeds() {
    return new PaginationEmbed.Embeds().setColor(0xFF00AE);
  }

  paginationFields() {
    return new PaginationEmbed.FieldsEmbed().setColor(0xFF00AE);
  }
}

module.exports = Command;
