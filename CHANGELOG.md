# 3.0.0

Please make sure you read the documentation [**here**](https://docs.thegzm.space/eros-bot) to fill you up without reading everything here.

***somewhat***-tl;dr: [**Using the Bot**](https://thegzm.gitbook.io/eros/using-the-bot)

## Noticeable Changes
- Moved all `server settings` commands under one command: `set` (e.g. `@Eros set prefix ?`) ([**Link**](https://thegzm.gitbook.io/eros/commands/set/set))
- Countdown Notification System ([**Link**](https://thegzm.gitbook.io/eros/commands/countdown/countdown))
- Tag System ([**Link**](https://thegzm.gitbook.io/eros/commands/tag/tag))
- Basic Leveling System ([**Link**](https://thegzm.gitbook.io/eros/leveling-system))
- Fun Category Commands ([**Link**](https://thegzm.gitbook.io/eros/commands/fun))
- Reworked Guide Command (Bot command version of this documentation) ([**Link**](https://thegzm.gitbook.io/eros/commands/general/guide))
- Removed deprecated KamihimeDB API methods
- Codebase overhaul with Typescript
- Migrated to MariaDB from SQLite

If you find this text file not helpful at all, please read the da— or you may proceed here to see a slightly more detailed explanations in some new features: https://discord.gg/8j4RUSq

## (Drumicube and Eunicorn)'s Legacy
Here are some of commands and functions inherited from `kamihime-bot` with additional tweaks:

- Added [**`insult`**](https://thegzm.gitbook.io/eros/commands/fun/insult) fun command (formerly `kbaka`)
- Added [**`quiz`**](https://thegzm.gitbook.io/eros/commands/fun/quiz) fun command (formerly undocumented and automated function)
- Added [**`Basic Leveling System`**](https://thegzm.gitbook.io/eros/leveling-system) (derived from `kudos`. Instead of `kudos points`, it's `EXP and Titles` now)
- Added [**`search flags`**](https://thegzm.gitbook.io/eros/commands/kamihime/info) (formerly `/kh Parameters`. e.g: `-k` `--kamihime` to `-tk` `--type=kamihime` / `-r` `--releaseweapon` / `-p` `--preview`)

With this section, it is a signal for `kamihime-bot` to completely shutdown. Thank you for your support! *manly tears*

Any changes mentioned above won't be re-listed here below, so please visit the links attached beside them, there is a chance you missed something.

## Additions
- Commands: Added `Leveling System Stats` on `memberinfo` command (now aliased with `level`)
- Commands: Added `stats` command
- Documentation: Added `CONTRIBUTING.md`
- Documentation: Added `doc-gen` (`yarn run docs:parse`). See `CONTRIBUTING` for Pull Requests

## Changes
- Commands: `countdown` command has been separated from `kamihime` category
- Commands: Removed `awaitingUsers` collection in favour of built-in `lock` option from `Akairo`
- Dependencies: Change from `twit` to `twitter-lite`
- Dependencies: Changed from `snekfetch` to `node-fetch`
- Documentation: README has been reworked. For developers please read it again
- Installer: Changed scripts from `NPM` to `Yarn`
- Namings: Changed from `APIError` to `ErosError`
- Namings: Changed from `guild` to `server`
- Namings: Changed from `Wikia` to `Fandom`
- Namings: Column names from the database's tables had their `ID` suffix removed

## Fixes
- Commands: "Required Permissions" fields are now prettier and according to Discord Client UI
- Commands: Usage notations are now appropriate according to the documentation
- Twitter: Duplicate posts are no longer a threat. So please don't pressure me on chopping more of my fingers off anymore! :blobsob:
