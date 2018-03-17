module.exports = {
  // this is your bot's token. get the actual token from your app page.
  // as discord dev page says, don't share this to anyone
  // or i hax
  TOKEN: 'mytokenisalive',

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
  blacklist: ['264445053596991498'],

  // emojis uploaded in your server:
  // get it from "\:emoji:"
  emojis: {
    // the emoji used for "Awaiting {{text}}..." prompts by the bot
    loading: '<a:atyping:408054205757259776>',
    // hmmm... no comment
    embarassed: '<:rassed:405542775619190786>'
  },

  // do not touch this unless you know what you're doing
  // pretty much obvious, so no explanation
  url: {
    wikia: 'https://kamihime-project.wikia.com/w/',
    api: 'http://kamihimedb.thegzm.space/api/',
    player: 'http://kamihimedb.thegzm.space/player/'
  },

  // API token for kamihime-database. Not really that token... let's say a secret.
  apiToken: 'whatisthepurposeofthis'
};
