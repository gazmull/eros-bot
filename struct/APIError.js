const cons = require('../utils/console');

class APIError {

  /**
   * Constructor for APIError.
   * @param {Message} message - The Message object of the client.
   * @param {Error} error - The Error object, if there is one.
   * @param {number} code - 0: Menu Selection, 1: KamihimeDB Request, 2: Kamihime Wikia Request
   */
  constructor(message, error = null, code = 3) {

    /**
     * @type {Message} - The Message object of the client.
     */
    this.message = message;

    /**
     * @type {Error} - The Error object, if there is one.
     */
    this.err = error;

    /**
     * @type {number} - 0: Menu Selection, 1: KamihimeDB Request, 2: Kamihime Wikia Request
     */
    this.code = code;

    this.execute();
  }

  execute() {
    if (this.err)
      cons.error(this.err.stack);

    const step =
      this.code === 0
        ? 'Menu Selection'
        : this.code === 1
          ? 'KamihimeDB Request'
          : this.code === 2
            ? 'Wikia Request'
            : 'Unknown Step';

    return this.message.edit(`I cannot complete the query because:\n\`\`\`x1\n${this.err}\`\`\`${this.code >= 0 && this.code <= 2 ? `Step: ${step}` : ''}`);
  }
}

module.exports = APIError;
