module.exports = {
  // this is your bot's token. get the actual token from your app page.
  // as discord dev page says, don't share this to anyone
  // or i hax
  token: 'mytokenisalive',

  // this is your id, get it from "\@mentionYourselfAtDiscord"
  // or turn on developer mode at discord settings then right click your name -> copy id
  ownerID: '319102712383799296',

  // this is the default documentation of the bot, dont replace if you wont change things
  docs: 'https://github.com/gazmull/eros-bot',

  // this the invite link for eros bot that i host 24/7.
  // of course replace this if you will self-host it
  inviteLink: 'http://addbot.thegzm.space',

  // default prefix. unified :bloblul:
  defaultPrefix: '?',

  // the blacklisted guilds (servers). default ID is Discord Bot List's
  blacklist: [ '264445053596991498' ],

  // emojis uploaded in your server:
  // get it from "\:emoji:"
  emojis: {
    // hmmm... no comment
    embarassed: '<:rassed:405542775619190786>',
    // the emoji used for "Awaiting {{text}}..." prompts by the bot
    loading: '<a:atyping:408054205757259776>'
  },

  // do not touch this unless you know what you're doing
  // pretty much obvious, so no explanation
  url: {
    api: 'http://kamihimedb.thegzm.space/api/',
    player: 'http://kamihimedb.thegzm.space/player/',
    root: 'http://kamihimedb.thegzm.space/',
    wikia: 'https://kamihime-project.wikia.com/w/'
  },

  // Authorised for coutdown management.
  countdownAuthorized: [ '319102712383799296' ],

  // API token for kamihime-database. Not really that token... let's say a secret.
  apiToken: 'whatisthepurposeofthis',

  // Get your own application at https://apps.twitter.com
  twitter: {
    access_token_key: 'xxxxxxxxxxxxxxxxx-xxxxxxxxxxxxxx',
    access_token_secret: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    consumer_key: 'xxx',
    consumer_secret: 'xxxxxxxxxxxxxx',
    user: '806331327108653057' // current ID: Kamihime_Nutaku (gettwitterid.com)
  }
};
