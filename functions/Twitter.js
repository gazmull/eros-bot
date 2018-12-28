const TwitterClient = require('twitter-lite');

const { status } = require('../utils/console');
const { twitter: config } = require('../auth');
const model = require('../provider/models/guild');

let tick = null;
let recon = null;

const init = client => {
  const twitter = new TwitterClient(config);
  const stream = twitter.stream('statuses/filter', { follow: config.user });

  stream
    .on('data', async tweet => {
      if (
        !tweet ||
        tweet.retweeted_status ||
        tweet.user.id_str !== config.user ||
        tweet.in_reply_to_status_id
      )
        return;

      const guilds = await model.findAll({ where: { twitterChannelID: { ne: null } } });

      tick = client.setInterval(() => {
        if (!guilds.length) return client.clearInterval(tick);

        const spliced = guilds.splice(0, 5);

        for (const guild of spliced) {
          const channel = client.channels.get(guild.twitterChannelID);

          if (!channel) continue;

          channel.send(`https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`);
        }
      }, 3000);

      status('Twitter Module: Sent tweet');
    })
    .on('start', () => status('Twitter Module: Connected to Twitter API'))
    .on('end', () => {
      status('Twitter Module: Disconnected from Twitter API');

      client.clearInterval(tick);
      client.clearInterval(recon);
      stream.destroy();
      recon = client.setTimeout(() => init(client), 6e4);
    })
    .on('error', err => status(`Twitter Module: Something went wrong: ${err}`));

  return 1;
};

module.exports = { init };
