import { ArgumentTypeCaster } from 'discord-akairo';
import { Util } from 'discord.js';
import ErosClient from '../ErosClient';

export default class CommandHandlerResolverTypes {
  constructor (client: ErosClient) {
    this.client = client;
  }

  protected client: ErosClient;

  public distribute (): { [name: string]: ArgumentTypeCaster } {
    return {
      existingTag: async (phrase, message) => {
        if (!phrase) return null;

        phrase = Util.cleanContent(phrase.toLowerCase(), message);
        const tag = await this.client.db.Tag.findOne({
          where: {
            name: phrase,
            guildId: message.guild.id
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
            guildId: message.guild.id
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
