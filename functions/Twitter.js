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

      const msg = `Twitter Module: Sent tweet ${tweet.id_str}`;
      const owner = await client.users.fetch(client.ownerID);

      owner.send(msg);

      status(msg);
    })
    .on('start', async () => {
      const msg = 'Twitter Module: Connected';
      const owner = await client.users.fetch(client.ownerID);

      owner.send(msg);

      status(msg);
    })
    .on('end', async () => {
      const msg = 'Twitter Module: Disconnected';
      const owner = await client.users.fetch(client.ownerID);

      owner.send(msg);
      status(msg);
      client.clearInterval(tick);
      client.clearInterval(recon);
      stream.destroy();

      recon = client.setTimeout(() => init(client), 6e4);
    })
    .on('error', async err => {
      const msg = `Twitter Module: Error ${err}`;
      const owner = await client.users.fetch(client.ownerID);
      owner.send(msg);

      status(msg);
    });

  return 1;
};

module.exports = { init };
