# Migrating From Kamihime Bot

By the time you're reading this, [**Kamihime Bot**](https://github.com/gazmull/kamihime-bot) does not exist anymore. Well don't worry, if you're looking for incompatibilities while trying to migrate to [**Eros**](https://github.com/gazmull/eros-bot), here's a list of changes from `Kamihime Bot` to `Eros`.

> Note: **Their namings are based on their documentation**. If they're found lacking, there will be substitutions or conclusions.

### Documentations

Kamihime Bot: [**Click Me!**](https://github.com/gazmull/kamihime-bot)

Eros: [**Click Me!**](https://docs.thegzm.space/eros-bot)

### Legends
- `<>` means required
- `[]` means optional
- `/` means it's from `Kamihime Bot`
- `?` means it's from `Eros`


| Difference                          | Kamihime Bot                     | Eros                            |
| ----------------------------------- | -------------------------------- | ------------------------------- |
| [/help vs ?help](#help)             | /help [command]                  | ?help [command]                 |
| [/kh vs ?i](#kh)                    | /kh \<name> [parameter]          | ?info \<item name> [flags]      |
| [/kp vs ?mi](#kp)                   | /kp [@username]                  | ?memberinfo [member name]       |
| N/A                                 | /latest                          | N/A                             |
| None                                | /invitebot                       | ?invite                         |
| [/countdown vs ?cd](#countdown)     | /countdown [command] [arguments] | ?countdown [method] [arguments] |
| [/kbaka vs ?insult](#kbaka)         | /kbaka \<@username>              | ?insult \<member> [--(un)stalk] |
| [/kudos vs Leveling System](#kudos) | /kudos \<@username>              | Automated System; ?level        |
|                                     |                                  |                                 |

---

## help
While there are no changes in the command usage, the details differs:
- Kamihime Bot: Gives very detailed explanation for every command.
- Eros: Gives short and technical information, however this has been reinforced with `?guide` command and/or the [**web documentation**](https://docs.thegzm.space/eros-bot).

---

## kh
Nothing much changed, however `flags` (or `parameter` from `Kamihime Bot`) is different to make way for the new `flags`:
- Kamihme Bot: /kh Amaterasu --kamihime -k
- Eros: ?kh Eros --type=kamihime -tk

### New Flags From Eros
- `--preview` / `-p` Show image
- `--release` / `--releases` / `--releaseweapon` / `-r` **Exclusive for Kamihime/Weapon** — Show the release weapon / kamihime release instead
- `--accurate` / `-a` Tells the bot the given name immediately resolves to a character/weapon name (e.g: `?kh Eros -a`).

---

## kp
While there are no changes in the command usage, the details differs:
- Kamihime Bot: Displays information provided by the user.
- Eros: Displays information provided by Discord, and stats provided by Leveling System.

---

## countdown
Most sub commands did not change, however there is a usage change to `countdown add`, and `/countdown format` has been renamed to `?countdown help`:
- Kamihime Bot: /countdown add An Event 1970-01-01T00:00
- Eros: ?countdown add 1970-01-01T00:00 An Event

### New Countdown Features From Eros
- Countdown notifications system added. See how to set this up [**here**](https://thegzm.gitbook.io/eros/commands/countdown/countdown-subscribe).
- Countdown command `test` is now usable for everyone.
- Countdown command `current` has been added. This shows the current time in Nutaku Server Time (PST/PDT).

---

## kbaka
While there are no changes in its function, the command usage differs:
- Kamihime Bot
  - Can only be used by authorised personnel.
  - /kbaka \<@username>
- Eros
  - Can be used by everyone, however `--stalk` flag (the behaviour of `/kbaka`) can only be used by authorised personnel.
  - ?insult \<member> [--(un)stalk]

---

## kudos
While not really inherited, `Leveling System` has similar traits to `/kudos`: building up your reputation.
- Kamihime Bot: /kudos \<@username>
- Eros: Automated by the bot; core command is `?level`. Check your progress with `?level info`. [**More info about Leveling System**](https://thegzm.gitbook.io/eros/leveling-system)
