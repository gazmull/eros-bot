import { TextChannel } from 'discord.js';
import * as TwitterClient from 'twitter-lite';
// @ts-ignore
import { twitter as config } from '../../auth';
import ErosClient from '../struct/ErosClient';
import { status, warn } from '../util/console';

let tick = null;
let recon = null;
let lastTweetID = null;

export const init = (client: ErosClient) => {
  if (!config) return warn('Twitter Module: Config is not set; skipped.');

  const ownerID = client.ownerID as string;
  const twitter = new TwitterClient(config);
  const stream = twitter.stream('statuses/filter', { follow: config.user });

  stream
    .on('data', async tweet => {
      if (
        !tweet ||
        tweet.retweeted_status ||
        tweet.user.id_str !== config.user ||
        tweet.in_reply_to_status_id ||
        lastTweetID === tweet.id_str
      )
        return;

      lastTweetID = tweet.id_str;
      // @ts-ignore
      const guilds = await client.db.Guild.findAll({ where: { twitterChannelID: { ne: null } } });

      tick = client.setInterval(() => {
        if (!guilds.length) return client.clearInterval(tick);

        const spliced = guilds.splice(0, 5);

        for (const guild of spliced) {
          const channel = client.channels.get(guild.twitterChannelID) as TextChannel;

          if (!channel) continue;

          channel.send(`https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`);
        }
      }, 3000);

      const msg = `Twitter Module: Sent tweet ${tweet.id_str}`;
      const owner = await client.users.fetch(ownerID);

      owner.send(msg);

      status(msg);
    })
    .on('start', async () => {
      const msg = 'Twitter Module: Connected';
      const owner = await client.users.fetch(ownerID);

      owner.send(msg);

      status(msg);
    })
    .on('end', async () => {
      const msg = 'Twitter Module: Disconnected';
      const owner = await client.users.fetch(ownerID);

      owner.send(msg);
      status(msg);
      client.clearInterval(tick);
      client.clearInterval(recon);
      stream.destroy();

      recon = client.setTimeout(() => init(client), 3e5);
    })
    .on('error', async err => {
      const msg = `Twitter Module: Error ${err}`;
      const owner = await client.users.fetch(ownerID);
      owner.send(msg);
      status(msg);

      stream.emit('end');
    });

  return 1;
};
