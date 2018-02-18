/*
  About this module:
    This is an extension of MessageEmbed for Discord.JS v12 and above to provide paginating of your content.
    The methods follow the MessageEmbed's methods style for consistency.

    I wrote this because somehow I needed it for some leaderboards shenanigans. :D
    Feel free to contribute.

  Author:
    https://bitbucket.org/gazmull
*/
const { MessageEmbed, TextChannel, GroupDMChannel, DMChannel, User } = require('discord.js');

/**
 * Options for the constructor.
 * @typedef {Object} PaginationOptions
 * @prop {Object} [authorisedUser=null] - The authorised user to navigate the pages.
 * @prop {Object} [channel=null] - The channel where to send the embed.
 * @prop {Object} [clientMessage=null] - Settings for the message sent by the client.
 * @prop {Array} [array] - An array of elements to paginate.
 * @prop {number} [elementsPerPage=10] - Items per page.
 * @prop {boolean} [pageIndicator=true] - Whether page number indicator on embed footer text is shown or not.
 * @prop {Object[]} [fields=[]] - An array formatted fields to input.
 * @prop {number|string} [page=1] - Jumps to a certain page upon PaginationEmbed.build().
*/

/**
 * @extends {MessageEmbed}
*/
class PaginationEmbed extends MessageEmbed {
  /**
   * 
   * @param {PaginationOptions} [options={}] Options for pagination utility.
   */
  constructor(options = {}) {
    if(typeof options !== 'object') throw new Error('Cannot invoke Pagination class without an actual options object.');

    super(options);

    /**
     * The authorised user to navigate the pages.
     * @type {Object}
     */
    this.authorisedUser = options.authorisedUser || null;

    /**
     * The channel where to send the embed.
     * @type {Object}
     */
    this.channel = options.channel || null;

    /**
     * Settings for the message sent by the client.
     * @type {Object}
     * @prop {Object} [message] - The message object sent by the client, if there is any.
     * @prop {string} [content] = The custom message content while preparing the embed. 
     */
    this.clientMessage = options.clientMessage;

    /**
     * An array of elements to paginate.
     * @type {Array}
     */
    this.array = options.array || [];

    /**
     * Maximum number of elements to be displayed per page.
     * @type {number}
     */
    this.elementsPerPage = options.elementsPerPage || 10;

    /**
     * Whether page number indicator on embed footer text is shown or not.
     * @type {boolean}
     */
    this.pageIndicator = options.pageIndicator || true;

    /**
     * An array of formatted fields to input.
     * PaginationEmbed.formatField() is recommended.
     * @type {Object[]}
     */
    this.fields = options.fields || [];

    /**
     * Jumps to a certain page upon PaginationEmbed.build().
     * As String: 'first', 'previous', 'next', 'last'
     * @type {number|string}
     */
    this.page = options.page || 1;

    this.pages = null;
  }

  /**
   * Elements in the current page.
   * @returns {Array<elements>}
   */
  get elementList() {
    const begin = (this.page - 1) * this.elementsPerPage;
    const end = begin + this.elementsPerPage;

    return this.array.slice(begin, end);
  }

  /** 
   * Build the Pagination Embed.
  */
  async build() {
    try{
      this
        .setAuthorisedUser(this.authorisedUser)
        .setChannel(this.channel)
        .setClientMessage(this.clientMessage.message, this.clientMessage.content)
        .setArray(this.array)
        .setElementsPerPage(this.elementsPerPage)
        .showPageIndicator(this.pageIndicator)
        .setPage(this.page);

      const message = this.clientMessage.message
        ? await this.clientMessage.message.edit(this.clientMessage.content)
        : await this.channel.send(this.clientMessage.content);
      this.setClientMessage(message, this.clientMessage.content);

      const isValidFields = Array.isArray(this.fields) && !!this.fields.length;
      if(!isValidFields) throw new Error('Cannot invoke Pagination class without initialising at least one field.');
      const fields = this.fields;
      this.fields = [];
      for(const elem in fields) {
        const field = fields[elem];
        this.formatField(field.name, field.value, field.inline);
      }

      this.pages = Math.ceil(this.array.length / this.elementsPerPage);

      this._loadList();
    }
    catch (err) { throw err; }
  }

  /**
   * Adds a field to the embed.
   * Same as MessageEmbed.addField, but value takes a function instead.
   * @param {string} [name] - Name of the field.
   * @param {Function} [value] - Value of the field. Function for Array.prototype.map().join('\n').
   * @param {boolean} [inline=true] - Whether the field is inline or not.
   * @returns {PaginationEmbed}
   */
  formatField(name, value, inline = true) {
    if(typeof value !== 'function') throw new Error('formatField() only accepts function type for field value.');
    this.fields.push({ name, value, inline });
    return this;
  }

  /**
   * Set the authorised person to navigate the pages.
   * @param {Object} [user] - The user object.
   * @returns {PaginationEmbed}
   */
  setAuthorisedUser(user = null) {
    if(user && user.constructor !== User) throw new Error('setAuthorisedUser() only accepts user object type.');
    this.authorisedUser = user;
    return this;
  }

  /**
   * Sets the array of elements to paginate.
   * @param {Array} [array] - An array of elements to paginate. 
   * @returns {PaginationEmbed}
   */
  setArray(array) {
    const isValidArray = Array.isArray(array) && !!array.length;
    if(!isValidArray) throw new Error('Cannot invoke Pagination class without initialising the array to paginate.');
    this.array = array;
    return this;
  }

  /**
   * The channel where to send the embed.
   * @param {Object} [channel=null] - The channel object.
   * @returns {PaginationEmbed}
   */
  setChannel(channel = null) {
    const isValidChannel = (
      channel.constructor === GroupDMChannel || channel.constructor === DMChannel || channel.constructor === TextChannel
    );
    if(!isValidChannel) throw new Error('setChannel() only accepts channel object type.');
    this.channel = channel;
    return this;
  }

  /**
   * Sets the settings for the message sent by the client.
   * @param {Object} [message=null] - The message object sent by the client, if there is any.
   * @param {string} [content='Preparing...'] - The custom message content while preparing the embed.
   * @returns {PaginationEmbed}
   */
  setClientMessage(message = null, content = null) {
    if(!content) content = 'Preparing...';
    this.clientMessage = { message, content };
    return this;
  }

  /**
   * Sets the maximum number of elements to be displayed per page.
   * @param {number} [number=10] - Maximum number of elements to be displayed per page.
   * @returns {PaginationEmbed}
   */
  setElementsPerPage(number = 10) {
    if(typeof number !== 'number') throw new Error('setElementsPerPage only accepts number type.');
    this.elementsPerPage = number;
    return this;
  }

  /** 
   * Sets to jump to a certain page upon calling PaginationEmbed.build().
   * @param {number|string} [param] - The page number to jump to. As String: 'first', 'previous', 'next', 'last'
   * @returns {PaginationEmbed}
   */
  setPage(param = 1) {
    const isString = typeof param === 'string';
    if(!(!isNaN(param) || isString)) throw new Error('setPage() only accepts number/string.');

    const navigator = {
      first: 1,
      previous: this.page === 1 ? this.page : this.page - 1,
      next: this.page === this.pages ? this.pages : this.page + 1,
      last: this.pages
    }[param];

    const isInvalidPage = (
      (
        !isNaN(param) && param < 1 && param > this.pages
      ) ||
      (
        isString && typeof navigator === 'undefined'
      )
    );
    if(isInvalidPage) throw new Error('Invalid page.');
    this.page = isString ? navigator : param;
    return this;
  }

  /**
   * Sets whether page number indicator on embed footer text is shown or not.
   * @param {boolean} [boolean]
   * @returns {PaginationEmbed}
  */
  showPageIndicator(boolean) {
    if(typeof boolean !== 'boolean') throw new Error('showPageIndicator() only accepts boolean type.');
    this.pageIndicator = boolean === true ? true : false;
    return this;
  }

  async _loadList() {
    const embed = this._drawList();
    await this.clientMessage.message.edit({ embed });
    this._drawNavigation();
  }

  _drawList() {
    const embed = new MessageEmbed();

    this.color ? embed.setColor(this.color) : null;
    this.title ? embed.setTitle(this.title) : null;
    this.description ? embed.setDescription(this.description) : null;
    this.pageIndicator ? embed.setFooter(`Page ${this.page} of ${this.pages}`) : null;

    for(const elem in this.fields) {
      const field = this.fields[elem];
      embed.addField(field.name, this.elementList.map(field.value).join('\n'), field.inline);
    }
    return embed;
  }

  async _drawNavigation() {
    this.page == 1 ? null : await this.clientMessage.message.react('⏮');
    this.page == 1 ? null : await this.clientMessage.message.react('◀');
    await this.clientMessage.message.react('↗');
    this.page == this.pages ? null : await this.clientMessage.message.react('▶');
    this.page == this.pages ? null : await this.clientMessage.message.react('⏭');
    await this.clientMessage.message.react('🗑');
    this._awaitResponse();
  }

  _loadPage(param = 1) {
    this.setPage(param);
    this._loadList();
  }

  async _awaitResponse() {
    const filter = (r, u) => {
      if(this.authorisedUser)
        return (
          !u.bot &&
          u.id === this.authorisedUser.id &&
          (
            r.emoji.name === '🗑' ||
            r.emoji.name === '⏮' || r.emoji.name === '◀' ||
            r.emoji.name === '↗' ||
            r.emoji.name === '▶' || r.emoji.name === '⏭'
          )
        );
      return (
        !u.bot &&
        (
          r.emoji.name === '🗑' ||
          r.emoji.name === '⏮' || r.emoji.name === '◀' ||
          r.emoji.name === '↗' ||
          r.emoji.name === '▶' || r.emoji.name === '⏭'
        )
      );
    };
    try {
      const responses = await this.clientMessage.message.awaitReactions(
        filter,
        {
          max: 1,
          time: 30 * 1000,
          errors: ['time']
        }
      );

      const response = responses.first();
      if(response.emoji.name === '🗑')
        return this.clientMessage.message.delete();

      await this.clientMessage.message.reactions.removeAll();

      switch(response.emoji.name) {
        case '⏮':
          this._loadPage('first');
          break;
        case '◀':
          this._loadPage('previous');
          break;
        case '↗':
          this._awaitResponseEx(response.users.last());
          break;
        case '▶':
          this._loadPage('next');
          break;
        case '⏭':
          this._loadPage('last');
          break;
      }
    }
    catch (c) {
      this.clientMessage.message.reactions.removeAll().catch(err => { throw err });
      if(c.stack)
        throw c;
    }
  }

  async _awaitResponseEx(user) {
    const channel = this.clientMessage.message.channel;
    const filter = m => {
      const content = parseInt(m.content);
      return (
        m.author.id === user.id &&
        (
          (!isNaN(content) && content !== this.page && content >= 1 && content <= this.pages) ||
          m.content.toLowerCase() === 'cancel'
        )
      );
    };
    const prompt = await channel.send(
      'To what page would you like to jump? Say `cancel` to cancel the prompt.'
    );
    try {
      const responses = await channel.awaitMessages(
        filter,
        {
          max: 1,
          time: 30 * 1000,
          errors: ['time']
        }
      );

      const response = responses.first();
      const content = !isNaN(response.content) ? parseInt(response.content) : response.content;

      await prompt.delete();
      await response.delete();
      if(content === 'cancel') {
        this._drawNavigation();
        return;
      }
      this._loadPage(content);
    }
    catch(c) {
      prompt.delete().catch(err => { throw err });
      if(c.stack)
        throw c;
    }
  }
}

module.exports = PaginationEmbed;