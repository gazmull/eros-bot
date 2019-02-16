import { ArgumentTypeCaster } from 'discord-akairo';
import { Util } from 'discord.js';
import * as moment from 'moment';
import CountdownCommand from '../../commands/countdown/countdown';
import ErosClient from '../ErosClient';

export default class CommandHandlerResolverTypes {
  constructor (client: ErosClient) {
    this.client = client;
  }

  protected client: ErosClient;

  public distribute (): { [name: string]: ArgumentTypeCaster } {
    return {
      question: phrase => {
        if (!phrase) return null;

        return phrase.endsWith('?') ? phrase : null;
      },
      existingCountdown: phrase => {
        if (!phrase) return null;

        const parent = this.client.commandHandler.modules.get('countdown') as CountdownCommand;
        const countdown = parent.resolveCountdown(phrase);

        return countdown ? null : phrase;
      },
      countdown: phrase => {
        if (!phrase) return null;

        const parent = this.client.commandHandler.modules.get('countdown') as CountdownCommand;
        const countdown = parent.resolveCountdown(phrase);

        return countdown || null;
      },
      countdownDate: phrase => {
        if (!phrase) return null;

        const parent = this.client.commandHandler.modules.get('countdown') as CountdownCommand;
        const parsed = moment(phrase, moment.HTML5_FMT.DATETIME_LOCAL, true).tz(parent.timezone, true);

        if (!parsed.isValid()) return null;

        const now = moment.tz(parent.timezone);
        const expired = now.isAfter(parsed);

        if (expired) return null;

        const result = moment
          .tz(parsed, parent.timezone)
          .seconds(0)
          .milliseconds(0);

        return result;
      },
      existingTag: async (phrase, message) => {
        if (!phrase) return null;

        phrase = Util.cleanContent(phrase.toLowerCase(), message);
        const tag = await this.client.db.Tag.findOne({
          where: {
            name: phrase,
            guild: message.guild.id
          }
        });

        if (tag || phrase.length > 256) return null;

        return phrase;
      },
      tag: async (phrase, message) => {
        if (!phrase) return null;

        phrase = Util.cleanContent(phrase.toLowerCase(), message);
        const tag = await this.client.db.Tag.findOne({
          where: {
            name: phrase,
            guild: message.guild.id
          }
        });

        return tag || null;
      },
      tagContent: async (content, message) => {
        if (!content || content.length > 1950) return null;

        content = Util.cleanContent(content, message);

        return content;
      }
    };
  }
}
