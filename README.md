<div align="center">
  <br />
    <a href="http://addbot.thegzm.space"><img src="https://i.imgur.com/cegarrO.png" width="940px" alt="eros banner" /></a>
  <br />
    <a href="https://travis-ci.org/gazmull/eros-bot"><img src="https://travis-ci.org/gazmull/eros-bot.svg?branch=master" alt="Build Status" /></a>
</div>

# Eros Bot Rewrite
  * Built with [**Discord.JS-Akairo Framework** (**Master**)](https://github.com/1computer1/discord-akairo)
    * Please read its documentation [**here**](https://1computer1.github.io/discord-akairo/master).
  * Version: **1.6.0**

> Eros is now rewritten with a new framework, which has a nice documentation, instead of my own framework, which is not well-documented and it'll be hard for any `to be developer/s` of this bot if I have to insist with the private framework.

## Features
  * Realtime Character/Weapon information pulls from [**Kamihime Project Nutaku Wikia**](https://kamihime-project.wikia.com)
  * Kamihime Database (Harem Scenes)
    * Again, only Nutaku version. Absolutely ***no*** DMM version. You may checkout my forum thread for some.
    * Uses RESTful API from [**Kamihime Database**](https://github.com/gazmull/kamihime-database)
  * Twitter updates from [**@Kamihime_Nutaku**](https://twitter.com/kamihime_nutaku)
    * Customise your `Twitter Channel` with `?twitterchannel <mention channel>`
  * Basic bot commands - See `help` command for more info on each command
  * Guild-wide Customisable Prefix
    * Default Prefix: **?** or **`@Eros` (Mention)**
  * You can now DM the bot directly for commands without the prefix unlike [**ErosClass**] Version
  * *More to come�*

## Commands
  * **Admin/Server Manager**
    * Main: `prefix`
    * Kamihime-specific: `loli`, `twitterchannel`, `nsfwchannel`, `nsfwrole`
  * **General**
    * Main: `help`, `invite`
  * **Utility**
    * Main: `memberinfo`, `serverinfo`, `ping`
    * Bot Owner: `eval`, `clear`
  * **Kamihime**
    * Main: `guide`, `nsfw`, `leaderboard`, `hareminfo`, `info`, `list`, `search`, `countdown`
    * Bot Owner: `add`, `delete`, `update`, `approve`, `flag`

## Hosting Eros
> ### [Add her to your server instead? (24/7)](http://addbot.thegzm.space)

  * Create a [**Bot Account**](https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token)
  * Eros requires at least [**Node 10**](https://nodejs.org) for runtime
    * Clone this repository [via command shell] after installing Node: `git clone https://github.com/gazmull/eros-bot.git`
    * Execute `npm install` (Before this, make sure you have [**Build Tools** (**Windows**)](https://github.com/felixrieseberg/windows-build-tools) | [**Build Tools** (**Linux**)](https://superuser.com/questions/352000/whats-a-good-way-to-install-build-essentials-all-common-useful-commands-on))
        * There might be a chance that NPM will fail to install the dependencies, see [Yarn](https://yarnpkg.com/en/docs/getting-started)
            * Execute `yarn` to initialise the installation.
    * Check `infobox-parser` in `node_modules`. If `index.js` is missing, then NPM failed to obtain the files; so
        * Delete `infobox-parser` folder then:
          * `git clone https://github.com/dijs/infobox-parser.git`
          * `cd infobox-parser`
          * `npm install` or `yarn`
          * `npm run build` or `yarn run build`
  * Create an `auth.js` file and obtain the template from `auth.example.js`. They are documented by `// comments` to help you set up the file
  * Run the bot!
    * Node: `node .`
    * Process Managers
      * [**Nodemon**](https://github.com/remy/nodemon): `nodemon`
      * [**PM2**](https://github.com/Unitech/pm2): `pm2 start index.js --name="Eros" --env production`

## Contributing
  * You have to fork this repository, and follow the project's ESLint configuration. Run `npm test` or `yarn test` to verify if your build is passing. Failing build will be rejected.
    * `npm install eslint` or `yarn add eslint` to install ESLint.
  * Suggestions/Issues are welcome!

## License
  MIT

> ### Let me know if there's still missing.
