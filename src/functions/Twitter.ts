import { AkairoClient } from 'discord-akairo';
import { TextChannel } from 'discord.js';
import * as TwitterClient from 'twitter-lite';

export default class {
  constructor (client: AkairoClient) {
    this.client = client;
  }

  public client: AkairoClient;

  protected stream = null;

  protected tick: NodeJS.Timer = null;

  protected recon: NodeJS.Timer = null;

  protected lastTweetId: string = null;

  public init () {
    const { twitter: config } = this.client.config;

    if (!config) return this.client.logger.warn('Twitter Module: Config is not set; skipped.');

    const ownerID = this.client.ownerID as string;
    const twitter = new TwitterClient(config);
    this.stream = twitter.stream('statuses/filter', { follow: config.user });

    this.stream
      .on('data', async (tweet: ITweet) => {
        if (
          !tweet ||
          tweet.retweeted_status ||
          tweet.user.id_str !== config.user ||
          tweet.in_reply_to_status_id ||
          this.lastTweetId === tweet.id_str
        )
          return;

        this.lastTweetId = tweet.id_str;
        const guilds = await this.client.db.Guild.findAll({
          where: { twitterChannel: { [this.client.db.Op.ne]: null } },
          attributes: [ 'id', 'twitterChannel' ]
        });

        this.tick = this.client.setInterval(() => {
          if (!guilds.length) return this.client.clearInterval(this.tick);

          const spliced = guilds.splice(0, 5);

          for (const guild of spliced) {
            const channel = this.client.channels.get(guild.twitterChannel) as TextChannel;

            if (!channel || (channel && channel.type !== 'text')) {
              this.client.logger.warn(
                `Twitter Module: Cannot distribute to ${guild.id}'s Twitter channel (not a valid text channel)`
              );

              continue;
            }
            if (!channel.permissionsFor(this.client.user.id).has([ 'VIEW_CHANNEL', 'SEND_MESSAGES' ])) {
              this.client.logger.warn(
                `Twitter Module: Cannot distribute to ${guild.id}'s Twitter channel (missing permissions)`
              );

              continue;
            }

            channel.send(`https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`)
              .catch();
          }
        }, 3000);

        const msg = `Twitter Module: Sent tweet ${tweet.id_str}`;
        const owner = await this.client.users.fetch(ownerID);

        owner.send(msg);

        this.client.logger.info(msg);
      })
      .on('start', async () => {
        const msg = 'Twitter Module: Connected';
        const owner = await this.client.users.fetch(ownerID);

        owner.send(msg);

        this.client.logger.info(msg);
      })
      .on('end', async () => {
        const msg = 'Twitter Module: Disconnected';
        const owner = await this.client.users.fetch(ownerID);

        owner.send(msg);
        this.client.logger.info(msg);
        this.client.clearInterval(this.tick);
        this.client.clearInterval(this.recon);
        this.stream.destroy();

        this.recon = this.client.setTimeout(() => this.init(), 3e5);
      })
      .on('error', async (err: Error) => {
        const msg = `Twitter Module: Error ${err}`;
        const owner = await this.client.users.fetch(ownerID);
        owner.send(msg);
        this.client.logger.info(msg);

        this.stream.emit('end');
      });

    return 1;
  }

  public destroy () {
    if (this.stream) this.stream.destroy();

    return this.client.logger.warn('Twitter Module: Self Destructed');
  }
}

interface ITweet {
  retweeted_status?: string;
  user: {
    id_str: string;
    screen_name?: string;
  };
  in_reply_to_status_id?: string;
  id_str: string;
}
