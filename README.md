<div align="center">
  <br />
    <a href="http://addbot.thegzm.space"><img src="エロース.webp" width="940px" alt="eros banner" /></a>
  <br />
    <a href="https://travis-ci.org/gazmull/eros-bot"><img src="https://travis-ci.org/gazmull/eros-bot.svg?branch=master" alt="Build Status" /></a>
</div>

# Eros Bot
- Built with [**Discord.JS-Akairo Framework** (**Master**)](https://github.com/1computer1/discord-akairo)
    - Please read its documentation [**here**](https://1computer1.github.io/discord-akairo/master).
- Version: **3.0.0**
- [**Discord Server**](http://thegzm.space)
- [**Bot Guide**](https://docs.thegzm.space/eros-bot)

# Features
- Realtime Character/Weapon information pulls from [**Kamihime Project Nutaku Fandom**](https://kamihime-project.fandom.com)
- Kamihime Database (Harem Scenes)
    - Only Nutaku version is available.
    - Uses REST API (JSON) from [**Kamihime Database**](https://github.com/gazmull/kamihime-database)
- Tweets updates from [**@Kamihime_Nutaku**](https://twitter.com/kamihime_nutaku)
    - Customise your `Twitter Channel` with `?twitterchannel <mention channel>`
- Get notified with in-game events via Countdown notification system
    - Customise your `Countdown Channel` with `?cdchannel <mention channel>`
- Save your memos with Tag system
    - See `tag` command for more info
- Basic bot commands
    - See `help` command for more info for each command
    - See `guide` command for an in-depth guide for each command
- Guild-wide Customisable Prefix
    - Default Prefix: **?** or **`@Eros` (Mention)**
- DM the bot directly for commands without the default prefix
    - e.g: `info Eros -tw`
- *More to come�*

# Commands
> For more information, see [**Bot Guide**](https://docs.thegzm.space/eros-bot) or say **`@Eros guide 4`** when using the bot.

- **Admin/Server Manager**
    - Main: `prefix`
    - Kamihime-specific: `loli`, `cdchannel`, `twitterchannel`, `nsfwchannel`, `nsfwrole`
- **General**
    - Main: `help`, `guide`, `invite`
- **Utility**
    - Main: `memberinfo`, `serverinfo`, `ping`, `stats`
    - Bot Owner: `eval`, `clear`
- **Tag**
    - Main: `tag`, `tags`
- **Kamihime**
    - Main: `nsfw`, `leaderboard`, `hareminfo`, `info`, `list`, `search`
- **Kamihime - Countdown**
    - Main: `countdown`

# Self-Hosting
> ### [**Add her to your server instead? (24/7)**](http://addbot.thegzm.space)

- Create a [**Bot Account**](https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token)
- Eros requires at least [**Node 10**](https://nodejs.org) for runtime and [**MariaDB 10.1**](https://mariadb.org) for data persistence
    - Clone this repository [via command shell] after installing the requirements above: `$ git clone https://github.com/gazmull/eros-bot.git`
    - Run `$ yarn` (Before this, make sure you have [**Yarn**](https://yarnpkg.com/en/docs/getting-started) and [**Build Tools** (**Windows**)](https://github.com/felixrieseberg/windows-build-tools) | [**Build Tools** (**Linux**)](https://superuser.com/questions/352000/whats-a-good-way-to-install-build-essentials-all-common-useful-commands-on))
    - You have to build the src too
        - `$ yarn --production=false`
        - `$ yarn run compile`
- Create an `auth.js` file and obtain the template from `auth.example.js`. They are documented by `// comments` to help you set up the file
- Run the bot!
    - Node: `node .`
    - Process Managers
        - [**Nodemon**](https://github.com/remy/nodemon): `$ yarn run dev:start`
        - [**PM2**](https://github.com/Unitech/pm2): `$ yarn run pm2`

# Contributing
Looking for feedbacks, so feel free to file an issue or a pull request!

## Issue
For an issue that is only needed to be addressed instantly (if you feel like it), proceed to the [**Discord server**](http://thegzm.space).

Please make sure your issue isn't reported at all before filing, instead submit a comment in the existing issue thread.
> File an issue [**here**](https://github.com/gazmull/eros-bot/issues)!

If an issue has a vague message, please do add:
    - Recreation steps
    - Screenshots

### Documentation (Issue)
If you cannot afford to do a pull request, you may as well submit documentation contributions via filing an issue, but please make sure it does follow the standards of the documentation.

## Pull Request

### Documentation (Pull Request)
> Since this still involves building the source code, please read [**Code**](#Code) first.

1. Proceed to [`src / commands / general / guide-pages`](/src/commands/general/guide-pages).
    > If you are writing to a general guide (not a command guide), feel free to edit `index.ts` once you're inside the folder mentioned above.

    > If you are writing to a command guide, proceed to [`commands`](/src/commands/general/guide-pages/commands).

    1. Select a category (e.g. `general` or `kamihime`).
    2. Go to `assets` and you should see `.ts` file for each command.
        - Feel free to either edit the file or create a new one— if it's a valid command within the bot.
        - Make sure you're following the syntax (open one file and you'll get the idea).
2. After doing everything above, run `$ yarn run docs:parse` to generate the updated documentation.
3. Make sure to do `$ git push` to the gh-pages branch!
4. File a [**Pull Request**](https://github.com/gazmull/eros-bot/compare/gh-pages).

### Code
> When adding/updating a command, `guide-pages` must be updated. See [**Documentation**](#Documentation-(Pull-Request))

1. Fork this repository, clone to your machine, and then follow the project's development configuration [e.g. TSLint]
    > `$ yarn --production=false` to install.

2. Code x10

3. Run `$ yarn test` to verify if your build is passing.
    > Failing build will be rejected at default.

4. Make sure to do `$ git push` to the master branch!
5. File a [**Pull Request**](https://github.com/gazmull/eros-bot/compare).

## Miscellaneous

### Developing with VSCode
> This is used to automatically hot-reload when there are source code changes.

1. Run task `tsc: watch`. Default shortcut keys: `ctrl + shift + b + b`
2. Run `$ yarn run dev:start`

# License
  MIT
