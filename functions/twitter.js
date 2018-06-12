const Twit = require('twit');

const { status } = require('../utils/console');
const { twitter: config } = require('../auth');
const model = require('../provider/models/guild');

class TwitterFunction {
  exec(client) {
    const twitter = new Twit(config);
    const stream = twitter.stream('statuses/filter', { follow: config.user });

    stream
      .on('tweet', async tweet => {
        if (tweet.retweeted_status || tweet.user.id_str !== config.user || tweet.in_reply_to_status_id)
          return;

        const guilds = await model.findAll({ where: { twitterChannelID: { ne: null } } });
        const embed = client.util.embed()
          .setColor(0xFF00AE)
          .setAuthor(`${tweet.user.name} (@${tweet.user.screen_name})`)
          .setURL(`https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`)
          .setTimestamp(new Date())
          .setDescription(tweet.text)
          .setThumbnail(tweet.user.profile_image_url);

        if (tweet.entities.media)
          embed.setImage(tweet.entities.media[0].media_url);

        const tick = client.setInterval(() => {
          if (!guilds.length) return client.clearInterval(tick);

          const spliced = guilds.splice(0, 5);

          for (const guild of spliced) {
            const channel = client.channels.get(guild.twitterChannelID);

            if (!channel) continue;

            channel.send({ embed });
          }
        }, 3000);
      })
      .on('connect', () => status('Twitter Module: Connecting to Twitter API...'))
      .on('connected', () => status('Twitter Module: Connected to Twitter API'))
      .on('disconnect', () => status('Twitter Module: Disconnected from Twitter API'))
      .on('error', err => status(`Twitter Module: Something went wrong: ${err}`));
  }
}

module.exports = TwitterFunction;