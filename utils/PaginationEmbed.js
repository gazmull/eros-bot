/*
  About this module:
    This is an extension of MessageEmbed for Discord.JS v12 and above to provide paginating of your content.
    The methods follow the MessageEmbed's methods style for consistency.

    I wrote this because somehow I needed it for some leaderboards shenanigans. :D
    Feel free to contribute.

  Author:
    https://bitbucket.org/gazmull
*/
const { MessageEmbed } = require('discord.js');

/**
 * Options for the constructor.
 * @typedef {Object} PaginationOptions
 * @prop {Object} [clientMessage] - Settings for the message sent by the client.
 * @prop {Array} [array] - An array of elements to paginate.
 * @prop {number} [elementsPerPage=10] - Items per page.
*/

/**
 * @extends {MessageEmbed}
 * @param {Object} [message] The message object that triggered the command.
 * @param {PaginationOptions} [options={}] Options for pagination utility.
*/
class PaginationEmbed extends MessageEmbed {
  constructor(message, options = {}) {
    super(options);

    if(!message.id) throw new Error('Cannot invoke Pagination class without an actual message object.');
    else if(typeof options !== 'object') throw new Error('Cannot invoke Pagination class without an actual options object.');

    /**
     * @type {Object}
     * The message object that triggered the command.
     */
    this.message = message;

    /**
     * Settings for the message sent by the client.
     * @type {Object}
     * @prop {Object} [message] - The message object sent by the client, if there is any.
     * @prop {string} [content] = The custom message content while preparing the embed. 
     */
    this.clientMessage = options.clientMessage || { message: null, content: 'Preparing...'};

    /**
     * @type {Array}
     * An array of elements to paginate.
     */
    this.array = options.array || [];

    /**
     * @type {number}
     * Maximum number of elements to be displayed per page.
     */
    this.elementsPerPage = options.elementsPerPage || 10;

    this.pages = null;

    this.currentPage = 1;

    this.fieldValueFunctions = [];
  }

  /**
   * @returns {Array<elements>}
   */
  get elementList() {
    const begin = (this.currentPage - 1) * this.elementsPerPage;
    const end = begin + this.elementsPerPage;

    return this.array.slice(begin, end);
  }

  /**
   * Adds a field to the embed.
   * Same as MessageEmbed.addField, but value takes a function instead.
   * @param {string} [name] - Name of the field.
   * @param {Function} [value] - Value of the field. Function for Array.prototype.map().
   * @param {boolean} [inline=true] - Whether the field is inline or not.
   * @returns {PaginationEmbed}
   */
  formatField(name, value, inline = true) {
    if(!this.array.length) throw new Error('Cannot invoke Pagination class without array element(s).');
    if(typeof value !== 'function') throw new Error('formatField() does not accept non-Function for value.');

    this.fieldValueFunctions.push(value)
    return this.addField(name, this.elementList.map(value).join('\n'), inline);
  }

  /**
   * Sets the array of elements to paginate.
   * @param {Array} [array] - An array of elements to paginate. 
   * @returns {PaginationEmbed}
   */
  setArray(array) {
    this.array = array;
    return this;
  }

  /**
   * Sets the settings for the message sent by the client.
   * @param {Object} [message] - The message object sent by the client, if there is any.
   * @param {string} [content] - The custom message content while preparing the embed.
   * @returns {PaginationEmbed}
   */
  setClientMessage(message = null, content = 'Preparing...') {
    this.clientMessage = { message, content };
    return this;
  }

  /**
   * Sets the maximum number of elements to be displayed per page.
   * @param {number} [number=10] Maximum number of elements to be displayed per page.
   * @returns {PaginationEmbed}
   */
  setElementsPerPage(number = 10) {
    this.elementsPerPage = number;
    return this;
  }

  /** 
   * Build the Pagination Embed.
  */
  async build() {
    const message = this.clientMessage.message
      ? await this.clientMessage.message.edit(this.clientMessage.content)
      : await this.message.channel.send(this.clientMessage.content);
    this.clientMessage.message = message;
    this.pages = Math.ceil(this.array.length / this.elementsPerPage);
    this.loadList();
  }

  async loadList() {
    const embed = this.drawList();
    await this.clientMessage.message.edit({ embed });
    this.drawNavigation();
  }

  drawList() {
    const embed = new MessageEmbed()
      .setDescription(
        `${this.description
          ? `${this.description}\n\n`
          : ''
        }Page **${this.currentPage}** of **${this.pages}**`
      );

    this.title ? embed.setTitle(this.title) : null;
    this.color ? embed.setColor(this.color) : null;
    if(!this.fields.length) throw new Error('Cannot invoke Pagination class without calling at least one formatField().');

    for(const elem in this.fields) {
      const field = this.fields[elem];
      embed.addField(field.name, this.elementList.map(this.fieldValueFunctions[elem]).join('\n'), field.inline);
    }
    return embed;
  }

  async drawNavigation() {
    this.currentPage == 1 ? null : await this.clientMessage.message.react('⏮');
    this.currentPage == 1 ? null : await this.clientMessage.message.react('◀');
    this.currentPage == this.pages ? null : await this.clientMessage.message.react('▶');
    this.currentPage == this.pages ? null : await this.clientMessage.message.react('⏭');
    await this.clientMessage.message.react('🗑');
    this.awaitResponse();
  }

  firstPage() {
    this.currentPage = 1;
    this.loadList();
  }

  previousPage() {
    this.currentPage -= 1;
    this.loadList();
  }

  nextPage() {
    this.currentPage += 1;
    this.loadList();
  }

  lastPage() {
    this.currentPage = this.pages;
    this.loadList();
  }

  async awaitResponse() {
    try {
      const responses = await this.clientMessage.message.awaitReactions((r, u) =>
        u.id === this.message.author.id &&
          ( r.emoji.name === '🗑' ||
            r.emoji.name === '⏮' || r.emoji.name === '◀' ||
            r.emoji.name === '▶' || r.emoji.name === '⏭' ),
        {
          max: 1,
          time: 30 * 1000,
          errors: ['time']
        }
      );

      if(responses.first().emoji.name === '🗑')
        return this.clientMessage.message.delete();

      await this.clientMessage.message.reactions.removeAll();

      switch(responses.first().emoji.name) {
        case '⏮':
          this.firstPage();
          break;
        case '◀':
          this.previousPage();
          break;
        case '▶':
          this.nextPage();
          break;
        case '⏭':
          this.lastPage();
          break;
      }
    }
    catch (c) {
      this.clientMessage.message.reactions.removeAll().catch(err => { throw err });
      if(c.stack)
        throw c;
    }
  }
}

module.exports = PaginationEmbed;