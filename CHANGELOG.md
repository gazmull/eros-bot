This log starts from `3.0.0`.

---

# 4.4.0

## Added
- `WeaponInfo`: Added Flores and Retaliate skills
- `EidolonInfo`: Added support for eidolons with sub effects & future FLB sub effect

## Internal
- Properly added debug flag
- Updated dependencies

# 4.3.3

## Changed
- `SRC`: Updated URLs and documentation notes
- `Tag`: Refactored to accept attachment as content as well

# 4.3.2

## Fixed
- `WeaponInfo`: Missing skills (Technica, Magnate, etc.)

# 4.3.1

## Fixed
- `Info`: Alphabetical indicator on abilities in wrong order
- `SoulInfo`: Invalid abilities' duration

# 4.3.0

## Added
- do0oOOoo0D

## Changed
- `KamihimeInfo`: Prepare for 2nd favourite weapons

## Fixed
- `EidolonInfo`: Incorrect parsing of summon CD and Duration

# 4.2.0

## Added
- `SoulInfo`: Full T4 Souls support
- `EidolonInfo`: LB-changing summon effect (e.g. Suzaku's) support

## Changed
- `command`(`info`): Remove SSR+ once used

## Fixed
- `client`: Mentions being escaped
- `command`(`owo`): Reflected text length restriction from origin
- `listener`(`guildCreate`): Bot leaving silently due to null owner

## Internal
- Changed linter from TSLint to ESLint-Typescript

# 4.1.14

## Fixed
- `Set`: Typo on `set-nsfwrole` command ID

# 4.1.13

## Changed
- `SoulInfo`: Tier names updated, T4 tier added

# 4.1.12

## Fixed
- `GDCleaner`: invalid `date` column

# 4.1.11

## Changed
- `SRC`: Updated to latest Discord.JS stable version due to Discord API changes (Intents feature)
- `commands`: Removed presence data in member info and server info

## Fixed
- `guild`: Guild data being wiped out on outage
- `command`(`tags`): Prefix typo on "too long" message

## Internal
- Added `--debug` for listening to debug messages of Discord.JS

# 4.1.10

## Fixed
- `command`(`tag-edit`): Excess unused param on retry-prompt

# 4.1.9

## Fixed
- `commands`: Invalid image URLs

# 4.1.8

## Fixed
- `struct`(`Info`):
  - Invalid URL for item portrait/preview
  - Missing weapon skills `Sprout` and `Transcend`
  - Missing weapon skill scale `Extra Large`

# 4.1.7

## Changed
- `build`: Prepend `npx` on package.json scripts

## Fixed
- `struct`(`Info`): Incorrect ability unlock hint for SSR girls with 4 abilities such as Fire Frey

# 4.1.6

## Fixed
- `struct`(`Info`):
  - Missing weapon skill `Race`
  - Incorrect ability unlock hints for SSR+ girls such as Cu Chulainn

# 4.1.5

## Fixed
- `struct`(`Info`): Missing ability unlock hints for SSR+ girls such as Raphael/Cu Chulainn

# 4.1.4

## Removed
- `command`(`countdown`): Enhancement Quest Presets (#23)

## Fixed
- `command`(`quiz`): Missing `N` answer choice (#26)

# 4.1.3

## Changed
- `dependencies`: Local logger => `@gazmull/logger`
- `dependencies`: `Pako` removed and added back `zlib-sync`

# 4.1.2

## Changed
- `docs`: `kamihimedb.thegzm.space` => `kamihimedb.win`

## Fixed
- `command`(`info`): Fix for 'undefined' text in Kamihime abilities
- `dependencies`: Updated Discord.JS due to new login method and now enforced to use Node 12

# 4.1.1

## Fixed
- `command`(`quiz`): Now supports weapons

# 4.1.0

## Added
- `commands`: Bot owners now being ignored for permissions check in case of emergencies
- `command`(`help`): Bot mention at the message's starting content will trigger help command
- `command`(`invite`): Added donation notice and `donate` alias

## Changed
- `function`(`CountdownScheduler`): Disabled due to issues with Discord API
- `struct`(`Info`): Changed burst and skill scales on weapons from `+` to numeric multipliers and `S/M/L` respectively. Parser now prioritises `skillType` in pre-FLB and FLB

## Fixed
- `Database`: IANA TZ Warning
- `command`(`info`): Fixed a bug where searching a weapon with kamihime release returns kamihime's information instead

# 4.0.1

## Fixed
- `command`(`info`): Empty template2 being bypassed
- `command`(`list`): `sortMatches.shift is not a function` / `Cannot read property 'toLowerCase' of undefined`


# 4.0.0

## Added
- `command`(`tag-delete`): `--purge` option for mass deletion.
- `commands`(`fun`): `mock`, `owo` commands. Added weapons on `quiz`.
- [`commands`(`kamihime`): `glossary` command](https://github.com/gazmull/eros-bot/issues/20)
- [`command`(`info`): Display for 2nd Power Up for Assist and 2nd Assist for Kamihime SSR+](https://github.com/gazmull/eros-bot/issues/18)
- [`command`(`list`): Preparing sort option for `kamihime/list` Command](https://github.com/gazmull/eros-bot/issues/15)
- `commands`(`info`): `--flb` / `-f` flag for FLB values (weapon)

## Changed
- [`commands`(`guide`, `help`): Transferred commands references from `guide` command to `help` command](https://github.com/gazmull/eros-bot/issues/19)
- `commands`: Reduced timeouts for awaiting emoji reacts.
- `docs`: Nutaku => DMM/Nutaku
- `docs`: Less childish documentation on some commands.
- `commands`(`countdown`): Refactored as a parent command, other 'commands' under its code has been broken down to further modules (`help`, `current`, inhibitor for moderator-level countdown commands) (does not affect the API blatantly)
- `commands`(`info`): Refactored some structures: moves weapon's FLB values to another embed, activated by `SSR+` emoji react function

## Removed
- `commands` / `docs`: Removed `loli` settings, and completely disables access to characters with loli contents on `hareminfo` command. If you insist to see them, please see [kamihimedb](https://kamihimedb.win) instead.
- `commands`(`util`): Removed `clear` command.
- `function`(`twitter`): Removed debug messages sent to the bot owner.

## Fixed
- `command`(`info`): Fixed `say cancel` thing whenever there is an ongoing instance of the command triggered by the same user.
- `command`(`countdown`): Allow current and help subcommands for normal users
- `commands`: `array is not iterable` on embeds-reliant commands
- [`docs`: Quotes on arguments with spaces are valid](https://github.com/gazmull/eros-bot/issues/16)
- `docs`: Fixed `this` context on descriptions to `the` context.
- `functions`: Immediately trigger distributors.

# 3.4.0

## Added
- `util`(`Logger`): Added object inspection, and added log rotation module.

## Fixed
- `functions`: Added self destruct methods lest of re-emission of `ready` DiscordClient event.
- `function`(`CountdownScheduler`): Added stricter guild channel check.

# 3.3.0

## Deprecated
- `command`(`set-loli`): Added notice for deprecation to strictly follow Discord Guidelines. Characters with loli contents will be restricted on later releases. If you insist on seeing them, please do visit [**Kamihime Database**](https://kamihimedb.win) instead.

## Added
- `command`(`info`): Added item rarity emojis
- `command`(`stats`): Added bot banner for teh lulz

## Changed
- `function`(`CountdownScheduler`): Removed ended notification on normal events.

## Fixed
- `typescript`: Removed `@ts-ignore` comment where it is unnecessary
- `command`(`guide`): Optimised parser

# 3.2.0

## Critical
- `readme`(`database`): Converting to utf8mb4 character set has been changed again to make sure to avoid key length errors. For existing database, please do the following on MariaDB CLI (assuming that you're already logged in and uses `eros` database):
```sql
ALTER DATABASE `eros` CHARACTER SET = utf8 COLLATE = utf8_unicode_ci;
ALTER TABLE `guilds` CHARACTER SET = utf8 COLLATE = utf8_unicode_ci;
ALTER TABLE `levels` CHARACTER SET = utf8 COLLATE = utf8_unicode_ci;
ALTER TABLE `storage` CHARACTER SET = utf8 COLLATE = utf8_unicode_ci;
ALTER TABLE `tags` CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
ALTER TABLE `titles` CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
```

## Added
- `command`(`info`): Added MEX display toggle for Souls (see `@Eros guide 21` or [here](https://thegzm.gitbook.io/eros/commands/kamihime/info))
- `commands`(`tags`): Added length restriction to prevent embed length error

## Changed
- `models`: Models has been refactored for concise structuring. Also changed from `sequelize v4` and `mysql2` to `sequelize v5-beta.15` with `sequelize-typescript v0.6.8-beta.0` and `mariadb`
- `functions/commands`: Changed Operator imports to `<client>.db` from `sequelize / <client>.sequelize`
- `util`(`console`): Refactored format
- `command`(`quiz`): Increased quiz limit to 5 / 10 for normal users and server managers respectively.

## Fixed
- `Info`: Removed unnecessary async / await keywords

# 3.1.0

## Added
- `command`(`stats`): Added NodeJS and OS info
- `commands`: Actually add Kamihime Bot aliases to comply with migration documentation
- `readme`(`database`): Added proper character set and collate. For existing database, please do the following on MariaDB CLI (assuming that you're already logged in and uses `eros` database):
```sql
ALTER DATABASE `eros` CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
ALTER TABLE `guilds` CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
ALTER TABLE `levels` CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
ALTER TABLE `storage` CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
ALTER TABLE `tags` CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
ALTER TABLE `titles` CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
```

## Changed
- `client`: Removed SequelizeProvider reliance to reduce memory usage

## Fixed
- `command`(`hareminfo`): No longer says `?nsfw` notice when nsfwRole is not configured.
- `command`(`nsfw`): Fixed message object being null error.

# 3.0.0

Please make sure you read the documentation [**here**](https://docs.thegzm.space/eros-bot) to fill you up without reading everything here.

***somewhat***-tl;dr: [**Using the Bot**](https://thegzm.gitbook.io/eros/using-the-bot) | [**Migrating from Kamihime bot to Eros**](https://thegzm.gitbook.io/eros/migrating)

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

## Added
- Commands: Added `Cooldown`— not *countdown* Notification.
- Commands: Added `Leveling System Stats` on `memberinfo` command (now aliased with `level`)
- Commands: Added `stats` command
- Documentation: Added `CONTRIBUTING.md`
- Documentation: Added `doc-gen` (`yarn run docs:parse`). See `CONTRIBUTING` for Pull Requests

## Changed
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

## Fixed
- Commands: Fixed harem episodes check not showing on Souls
- Commands: "Required Permissions" fields are now prettier and according to Discord Client UI
- Commands: Usage notations are now appropriate according to the documentation
- Functions: Twitter duplicate posts are no longer a threat. So please don't pressure me on chopping more of my fingers off anymore! :blobsob:
