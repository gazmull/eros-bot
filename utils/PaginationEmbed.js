/*
  About this module:
    This is an extension of MessageEmbed for Discord.JS v12 and above to provide paginating of your content.
    The methods somehow follow the MessageEmbed's methods style for consistency/familiarity.

    I wrote this because somehow I needed it for some leaderboards shenanigans. :D
    Feel free to contribute.

  Author:
    https://bitbucket.org/gazmull
*/

/**
 * Options for clientMessage.
 * @typedef {Object} ClientMessageOptions
 * @prop {Object} [message=null] - The message object sent by the client, if there is any.
 * @prop {String} [content='Preparing...'] - The custom message content while preparing the embed.
 */

/**
* The unique ID or unique unicode character of the emoji.
* @typedef {String} EmojiResolvable
*/

/**
 * An array of emojis for navigation buttons.
 * @typedef {Object} NavigationButtons
 * @prop {EmojiResolvable} first - The first page button.
 * @prop {EmojiResolvable} previous - The previous page button.
 * @prop {EmojiResolvable} jump - The 'jump to page' button.
 * @prop {EmojiResolvable} next - The next page button.
 * @prop {EmojiResolvable} last - The last page button.
 * @prop {EmojiResolvable} delete  - The delete button.
 */

/**
 * Options for PaginatonEmbed.fields.
 * @typedef {Object[]} FieldOptions
 * @prop {String} name - Name of the field.
 * @prop {Function} value - Value of the field. Function for Array.prototype.map().join('\n').
 * @prop {Boolean} [inline=true] - Whether the field is inline with other field or not.
 */

/**
 * Options for the constructor.
 * @typedef {Object} PaginationOptions
 * @prop {Object} [authorisedUser=null] - The authorised user to navigate the pages.
 * @prop {Object} channel - The channel where to send the embed.
 * @prop {ClientMessageOptions} [clientMessage=null] - Settings for the message sent by the client.
 * @prop {Array} array - An array of elements to paginate.
 * @prop {Number} [elementsPerPage=10] - Items per page.
 * @prop {Boolean} [pageIndicator=true] - Whether page number indicator on embed footer text is shown or not.
 * @prop {FieldOptions} fields - An array formatted fields to input.
 * @prop {Number|String} [page=1] - Jumps to a certain page upon PaginationEmbed.build().
 * @prop {EmojiResolvable[]} [emojis] - An array of Emoji IDs.
 */

const { Message, MessageEmbed, TextChannel, GroupDMChannel, DMChannel, User } = require('discord.js');
const defaultEmojis = {
  first: '⏮',
  previous: '◀',
  jump: '↗',
  next: '▶',
  last: '⏭',
  delete: '🗑'
};

/**
 * @extends {MessageEmbed}
 */
class PaginationEmbed extends MessageEmbed {
  /**
   * @param {PaginationOptions} [options={}] Options for pagination utility.
   */
  constructor(options = {}) {
    if (typeof options !== 'object') throw new Error('Cannot invoke Pagination class without an actual options object.');

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
     * @type {ClientMessageOptions}
     */
    this.clientMessage = options.clientMessage;

    /**
     * An array of elements to paginate.
     * @type {Array}
     */
    this.array = options.array || [];

    /**
     * Maximum number of elements to be displayed per page.
     * @type {Number}
     */
    this.elementsPerPage = options.elementsPerPage || 10;

    /**
     * Whether page number indicator on embed footer text is shown or not.
     * @type {Boolean}
     */
    this.pageIndicator = options.pageIndicator || true;

    /**
		 * Emojis to react as navigation buttons.
		 * Emojis should be cached in the bot.
		 * @type {NavigationButtons}
		 */
    this.emojis = options.emojis || defaultEmojis;

    /**
     * An array of formatted fields to input.
     * PaginationEmbed.formatField() is recommended.
     * @type {FieldOptions}
     */
    this.fields = options.fields || [];

    /**
     * Jumps to a certain page upon PaginationEmbed.build().
     * As String: 'first', 'previous', 'next', 'last'
     * @type {Number|String}
     */
    this.page = options.page || 1;

    this.pages = null;
  }

  /**
   * Elements in the current page.
   * @returns {*[]} - An array for a page.
   */
  get elementList() {
    const begin = (this.page - 1) * this.elementsPerPage;
    const end = begin + this.elementsPerPage;

    return this.array.slice(begin, end);
  }

  /**
   * Build the Pagination Embed.
   * @returns {Void} - void
   *
   * @example
   *
   * // Object as constructor.
   * const PaginationEmbed = require('discord-pagination-embed');
   *
   * // ...
   *
   * // Under message event.
   * new PaginationEmbed({
   *  authorisedUser: message.author,
   *  channel: message.channel,
   *  clientMessage: { content: 'Preparing the embed...' },
   *  array: [
   *    { id: 1, name: 'John Doe' },
   *    { id: 2, name: 'Jane Doe' }
   *  ],
   *  elementsPerPage: 1,
   *  pageIndicator: false,
   *  fields: [
   *    { name: 'ID', value: el => el.id },
   *    { name: 'Name', value: el => el.name }
   *  ],
   *  page: 2
   * }).build();
   *
   * @example
   *
   * // Methods as constructor.
   * const PaginationEmbed = require('discord-pagination-embed');
   *
   * // ...
   *
   * // Under message event.
   * new PaginationEmbed()
   *  .setAuthorisedUser(message.author)
   *  .setChannel(message.channel)
   *  .setClientMessage(null, 'Preparing the embed...')
   *  .setArray([
   *    { id: 1, name: 'John Doe' },
   *    { id: 2, name: 'Jane Doe' }
   *  ])
   *  .setElementsPerPage(1)
   *  .setPageIndicator(false)
   *  .formatField('ID', el => el.id)
   *  .formatField('Name', el => el.name)
   *  .setPage(2)
   *  .build();
   */
  async build() {
    try {
      this
        .setAuthorisedUser(this.authorisedUser)
        .setChannel(this.channel)
        .setClientMessage(this.clientMessage.message, this.clientMessage.content)
        .setArray(this.array)
        .setElementsPerPage(this.elementsPerPage)
        .showPageIndicator(this.pageIndicator)
        .setPage(this.page);
      // .setEmojis(this.emojis);

      const message = this.clientMessage.message
        ? await this.clientMessage.message.edit(this.clientMessage.content)
        : await this.channel.send(this.clientMessage.content);
      this.setClientMessage(message, this.clientMessage.content);

      const isValidFields = Array.isArray(this.fields) && Boolean(this.fields.length);
      if (!isValidFields) throw new Error('Cannot invoke Pagination class without initialising at least one field.');

      const fields = this.fields;
      this.fields = [];
      for (const elem in fields) {
        const field = fields[elem];

        this.formatField(field.name, field.value, field.inline);
      }

      this.pages = Math.ceil(this.array.length / this.elementsPerPage);

      this._loadList();
    } catch (err) {
      throw err;
    }
  }

  /**
   * Adds a field to the embed.
   * Same as MessageEmbed.addField, but value takes a function instead.
   * @param {string} name - Name of the field.
   * @param {Function} value - Value of the field. Function for Array.prototype.map().join('\n').
   * @param {boolean} [inline=true] - Whether the field is inline with other field or not.
   * @default true - Default for inline
   * @returns {PaginationEmbed} - Instance of PaginationEmbed
   */
  formatField(name, value, inline = true) {
    if (typeof value !== 'function') throw new Error('formatField() only accepts function type for field value.');

    this.fields.push({ name, value, inline });

    return this;
  }

  /**
   * Set the authorised person to navigate the pages.
   * @param {Object} [user=null] - The user object.
   * @default null
   * @returns {PaginationEmbed} - Instance of PaginationEmbed
   */
  setAuthorisedUser(user = null) {
    if (user && user.constructor !== User) throw new Error('setAuthorisedUser() only accepts user object type.');

    this.authorisedUser = user;

    return this;
  }

  /**
   * Sets the array of elements to paginate.
   * @param {Array} array - An array of elements to paginate.
   * @returns {PaginationEmbed} - Instance of PaginationEmbed
   */
  setArray(array) {
    const isValidArray = Array.isArray(array) && Boolean(array.length);
    if (!isValidArray) throw new Error('Cannot invoke Pagination class without initialising the array to paginate.');

    this.array = array;

    return this;
  }

  /**
   * The channel where to send the embed.
   * @param {Object} channel - The channel object.
   * @returns {PaginationEmbed} - Instance of PaginationEmbed
   */
  setChannel(channel) {
    const isValidChannel = (
      channel.constructor === GroupDMChannel || channel.constructor === DMChannel || channel.constructor === TextChannel
    );
    if (!isValidChannel) throw new Error('setChannel() only accepts channel object type.');

    this.channel = channel;

    return this;
  }

  /**
   * Sets the settings for the message sent by the client.
   * @param {Object} [message=null] - The message object sent by the client, if there is any.
   * @param {string} [content='Preparing...'] - The custom message content while preparing the embed.
   * @default null - Default for the message object.
   * @default 'Preparing...' - Default for the message content.
   * @returns {PaginationEmbed} - Instance of PaginationEmbed
   */
  setClientMessage(message = null, content = null) {
    const isInvalidMessage = message && message.constructor !== Message;
    if (isInvalidMessage) throw new Error('setClientMessage() only accepts message object type.');
    if (!content) content = 'Preparing...';

    this.clientMessage = { message, content };

    return this;
  }

  /**
   * Sets the maximum number of elements to be displayed per page.
   * @param {number} [number=10] - Maximum number of elements to be displayed per page.
   * @default 10
   * @returns {PaginationEmbed} - Instance of PaginationEmbed
   */
  setElementsPerPage(number = 10) {
    if (typeof number !== 'number') throw new Error('setElementsPerPage() only accepts number type.');

    this.elementsPerPage = number;

    return this;
  }

  /**
	 * Sets the emojis to react as navigation buttons.
	 * Custom emojis should be cached in the bot.
   * @protected
	 * @param {NavigationButtons} [emojis={}] - An array of emojis.
	 * @returns {PaginationEmbed} - Instance of PaginationEmbed
   * @example
   *
   * // Default Emojis
   * {
   *   first: '⏮',
   *   previous: '◀',
   *   jump: '↗',
   *   next: '▶',
   *   last: '⏭',
   *   delete: '🗑'
   * }
	 */

  /* eslint-disable no-unreachable */
  setEmojis(emojis = defaultEmojis) {
    throw new Error('This method is not available.');
    if (typeof emojis !== 'object') throw new Error('setEmojis() only accepts an Object of strings/emojis.');

    for (const emoji in emojis) {
      const client = this.clientMessage.message.client;
      client.emojis.get(emoji);
    }
  }
  /* eslint-enable no-unreachable */

  /**
   * Sets to jump to a certain page upon calling PaginationEmbed.build().
   * @param {Number|String} [param=1] - The page number to jump to. As String: 'first', 'previous', 'next', 'last'
   * @default 1
   * @returns {PaginationEmbed} - Instance of PaginationEmbed
   */
  setPage(param = 1) {
    const isString = typeof param === 'string';
    if (!(!isNaN(param) || isString)) throw new Error('setPage() only accepts number/string.');

    const navigator = {
      first: 1,
      previous: this.page === 1 ? this.page : this.page - 1,
      next: this.page === this.pages ? this.pages : this.page + 1,
      last: this.pages
    }[param];

    const isInvalidPage = (
      (!isNaN(param) && (param < 1 || param > this.pages)) ||
      (isString && typeof navigator === 'undefined')
    );
    if (isInvalidPage) throw new Error('Invalid page.');

    this.page = isString ? navigator : param;

    return this;
  }

  /**
   * Sets whether page number indicator on embed footer text is shown or not.
   * @param {boolean} [boolean=true] - Show page indicator?
   * @default true
   * @returns {PaginationEmbed} - Instance of PaginationEmbed
   */
  showPageIndicator(boolean = true) {
    if (typeof boolean !== 'boolean') throw new Error('showPageIndicator() only accepts boolean type.');

    this.pageIndicator = boolean === true;

    return this;
  }

  /**
	 * Prepares the PaginationEmbed.
   * @protected
	 * @returns {MessageEmbed} - Instance of MessageEmbed.
   */
  _drawList() {
    const embed = new MessageEmbed();

    if (this.color) embed.setColor(this.color);
    if (this.title) embed.setTitle(this.title);
    if (this.description) embed.setDescription(this.description);
    if (this.pageIndicator) embed.setFooter(`Page ${this.page} of ${this.pages}`);

    for (const elem in this.fields) {
      const field = this.fields[elem];

      embed.addField(field.name, this.elementList.map(field.value).join('\n'), field.inline);
    }

    return embed;
  }

  /**
	 * Deploys emoji reacts for the MessageEmbed.
   * @protected
	 * @returns {Void} - void
   */
  async _drawNavigation() {
    if (this.page !== 1) await this.clientMessage.message.react('⏮');
    if (this.page !== 1) await this.clientMessage.message.react('◀');
    if (this.pages > 2) await this.clientMessage.message.react('↗');
    if (this.page !== this.pages) await this.clientMessage.message.react('▶');
    if (this.page !== this.pages) await this.clientMessage.message.react('⏭');
    await this.clientMessage.message.react('🗑');

    this._awaitResponse();
  }

  /**
	 * Initialises the MessageEmbed.
   * @protected
   * @param {boolean} [callNavigation=true] - Whether to call _drawNavigation() or not.
   * @default true
	 * @returns {Void} - void
   */
  async _loadList(callNavigation = true) {
    const embed = this._drawList();
    await this.clientMessage.message.edit({ embed });

    if (callNavigation) this._drawNavigation();
  }

  /**
	 * Calls PaginationEmbed.setPage().
   * @protected
   * @param {number} param - The page number to jump to. As String: 'first', 'previous', 'next', 'last'
	 * @returns {Void} - void
   */
  async _loadPage(param = 1) {
    const oldPage = this.page;
    this.setPage(param);

    if (oldPage === 1 || oldPage === this.pages || this.page === 1 || this.page === this.pages) {
      await this.clientMessage.message.reactions.removeAll();

      this._loadList(true);
    } else {
      this._loadList(false);

      this._awaitResponse();
    }
  }

  /**
	 * Awaits the reaction from the user.
   * @protected
	 * @returns {Void} - void
   */
  async _awaitResponse() {
    const filter = (r, u) => {
      if (this.authorisedUser)
        return (
          !u.bot &&
          u.id === this.authorisedUser.id && (
            r.emoji.name === '🗑' ||
            r.emoji.name === '⏮' || r.emoji.name === '◀' ||
            r.emoji.name === '↗' ||
						r.emoji.name === '▶' || r.emoji.name === '⏭'
          )
        );

      return (
        !u.bot && (
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
        },
      );

      const response = responses.first();
      const user = response.users.last();
      if (response.emoji.name === '🗑') return this.clientMessage.message.delete();

      await response.users.remove(user);

      switch (response.emoji.name) {
      case '⏮':
        this._loadPage('first');
        break;
      case '◀':
        this._loadPage('previous');
        break;
      case '↗':
        this._awaitResponseEx(user);
        break;
      case '▶':
        this._loadPage('next');
        break;
      case '⏭':
        this._loadPage('last');
        break;
      }
    } catch (c) {
      this.clientMessage.message.reactions.removeAll().catch(err => {
        throw err;
      });
      if (c.constructor === Error) throw c;
    }
  }

  /**
	 * Awaits the custom page input from the user.
   * @protected
   * @param {Object} user - The user who reacted to jump on a certain page.
	 * @returns {Void} - void
   */
  async _awaitResponseEx(user) {
    const channel = this.clientMessage.message.channel;
    const filter = m => {
      const content = parseInt(m.content);

      return (
        m.author.id === user.id && (
          (!isNaN(content) && content !== this.page && content >= 1 && content <= this.pages) ||
					m.content.toLowerCase() === 'cancel'
        )
      );
    };
    const prompt = await channel.send('To what page would you like to jump? Say `cancel` to cancel the prompt.');
    try {
      const responses = await channel.awaitMessages(
        filter,
        {
          max: 1,
          time: 30 * 1000,
          errors: ['time']
        },
      );

      const response = responses.first();
      const content = isNaN(response.content) ? response.content : parseInt(response.content);

      await prompt.delete();
      await response.delete();
      if (content === 'cancel') {
        this._awaitResponse();

        return;
      }

      this._loadPage(content);
    } catch (c) {
      prompt.delete().catch(err => {
        throw err;
      });
      if (c.constructor === Error) throw c;
    }
  }
}

module.exports = PaginationEmbed;