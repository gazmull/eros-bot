![eros banner](https://github.com/gazmull/eros-bot/blob/master/エロース.webp?raw=true)

[![Travis (.org) branch](https://img.shields.io/travis/gazmull/eros-bot/master.svg?logo=travis&style=for-the-badge)](https://travis-ci.org/gazmull/eros-bot)
[![GitHub package.json version (branch)](https://img.shields.io/github/package-json/v/gazmull/eros-bot/master.svg?color=black&label=version&logo=github&style=for-the-badge)](https://github.com/gazmull/eros-bot)

# Eros Bot
- Built with [**Discord.JS-Akairo Framework** (**Master**)](https://github.com/1computer1/discord-akairo)
    - Please read its documentation [**here**](https://1computer1.github.io/discord-akairo/master).
- [**What's new?**](CHANGELOG.md#4-0-0)
- [**Discord Server**](http://erosdev.thegzm.space)
- [**Bot Guide**](https://docs.thegzm.space/eros-bot)

# Features
- Realtime Character/Weapon information pulls from [**Kamihime PROJECT EN Fandom**](https://kamihime-project.fandom.com)
- Kamihime Database (Harem Scenes)
    - Only Kamihime EN (Nutaku) version is available.
    - Uses REST API (JSON) from [**Kamihime Database**](https://github.com/gazmull/kamihime-database)
- Tweets updates from [**@Kamihime_EN**](https://twitter.com/kamihime_en)
    - Customise the `Twitter Channel` with `?set twitterchannel <channel>`
- Get notified with in-game events via Countdown notification system
    - Customise the `Countdown Channel` with `?set cdchannel <channel>`
- Enjoy staying in your server by gaining a grand title and EXPs with Leveling System
    - See `level` command for more info
- Customise your server settings
    - See `set` command for more info
- Save memos or notes with Tag system
    - See `tag` command for more info
- Basic bot commands
    - See `help` command for more info for each command
    - See `guide` command for an in-depth guide for each command
- Server-wide Customisable Prefix
    - Default Prefix: **?** or **`@Eros` (Mention)**
- DM the bot directly for commands without the default prefix
    - e.g: `info Eros -tw`
- *More to come�*

# Commands
> For more information, see [**Bot Guide**](https://docs.thegzm.space/eros-bot) or say **`@Eros guide 5`** when using the bot.

- **Server Settings**
    - Main: `set`, `settings`
- **General**
    - Main: `help`, `guide`, `invite`
- **Kamihime**
    - Main: `nsfw`, `leaderboard`, `hareminfo`, `info`, `list`, `search`
- **Kamihime - Countdown**
    - Main: `countdown`
- **Tag**
    - Main: `tag`, `tags`
- **Fun**
    - Main: `ask`, `insult`, `say`, `mock`, `owo`, `quiz`
- **Leveling System**
    - Main: `level`
- **Utility**
    - Main: `memberinfo`, `serverinfo`, `ping`, `stats`
    - Bot Owner: `eval`

# Self-Hosting
> ### [**Add the bot instead? (24/7)**](http://addbot.thegzm.space)

- Create a [**Bot Account**](https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token)
- Eros requires at least [**Node 10**](https://nodejs.org) for runtime and [**MariaDB 10.1**](https://mariadb.org) for data persistence
    - Clone this repository [via command shell] after installing the requirements above
      - `$ git clone https://github.com/gazmull/eros-bot.git`
      - `$ cd eros-bot`
    - Run `$ yarn` (Before this, make sure [**Yarn**](https://yarnpkg.com/en/docs/getting-started) and [**Build Tools** (**Windows**)](https://github.com/felixrieseberg/windows-build-tools) | [**Build Tools** (**Linux**)](https://superuser.com/questions/352000/whats-a-good-way-to-install-build-essentials-all-common-useful-commands-on) are installed)
    - `src` must also be built
        - `$ yarn --production=false`
        - `$ yarn run compile`
- Create an `auth.js` file and obtain the template from `auth.example.js`. They are documented by `// comments` to help set up the file
- Create a database. If the following defaults from `auth.js` (`database` and `usename`) were not changed, everything below can be copied and pasted without an issue— make sure to replace texts with `[]`
    - Before doing the steps below, please make sure `db`'s properties has been **properly** configured for security purposes
    - `$ mysql -u root`, assuming the MariaDB setup has no password on root. If it has password, append `-p`
    - Execute every line once inside MariaDB CLI:
```sql
CREATE DATABASE `eros` CHARACTER SET = 'utf8' COLLATE = 'utf8_unicode_ci';
CREATE USER `eros`@`localhost` IDENTIFIED BY '[password in auth.js]';
GRANT ALL PRIVILEGES ON `eros`.* TO `eros`@`localhost`;
exit;
```
- Run the bot!
    - Node: `node .`
    - Process Managers
        - [**Nodemon**](https://github.com/remy/nodemon): `$ yarn run dev:start`
        - [**PM2**](https://github.com/Unitech/pm2): `$ yarn run pm2`

# [Contributing](https://github.com/gazmull/eros-bot/blob/master/.github/CONTRIBUTING.md)

# License
> [**MIT**](https://github.com/gazmull/eros-bot/blob/master/LICENSE)

© 2018-present [**Euni (gazmull)**](https://github.com/gazmull)
