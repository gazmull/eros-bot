// @ts-ignore
import { url } from '../../../../auth.js';
// @ts-ignore
import { bugs } from '../../../../package.json';

const wikiDiscord = 'https://discord.gg/jFzQsEs';

/* tslint:disable:max-line-length */

/**
 * Similar to MessageEmbed. If you have contributed to this section, please add your username
 * in `contributors` property (while maintaining alphabetical order).
 * @see [MessageEmbed](https://discord.js.org/#/docs/main/master/class/MessageEmbed)
 */
export const dialogs: IDialog[] = [
  // Page 2
  {
    contributors: [ 'Euni', 'J-Star' ],
    title: 'Guide Start',
    description: 'Are you familiar with the game? No? These links may help you... but maybe for the last section...',
    fields: [
      {
        name: 'Kamihime Project Wiki',
        value: `[DMM Wiki](https://goo.gl/xPVW9t) | [Nutaku Wiki](https://kamihime-project.fandom.com) ([Discord](${wikiDiscord}))`,
        inline: true
      },
      {
        name: 'Kamihime Project Forums',
        value: '[Kamihime Project - Harem Time Forums](http://harem-battle.club/kamihime-project/)',
        inline: true
      },
      {
        name: '[Beginner] Guides',
        value: [
          'Sanahtlig: [Toolbox](https://goo.gl/bP43qi) | [Game Guide](https://goo.gl/YMcg1h) | [Re-rolling: How to get FREE SSR Kamihime](https://goo.gl/eJffLx)',
          'J-Star: [Weapon Guide](https://goo.gl/gGwvUX) | [Weapon Grids Template](https://goo.gl/dhrwgk)',
        ],
        inline: true
      },
      {
        name: 'Harem Episodes',
        value: [
          'Eliont: [Kamihime Player](https://goo.gl/XjWD93)',
          'Euni: [Kamihime Web Player](https://kamihimedb.thegzm.space)',
        ],
        inline: true
      },
    ]
  },
  // Page 3
  {
    contributors: [ 'Euni' ],
    title: 'Using the Bot',
    fields: [
      {
        name: 'Setup',
        value: [
          'Eros requires the following permissions:',
          '```diff',
          '+ Add Reactions',
          '+ Embed Links',
          '+ Manage Messages',
          '+ Manage Roles',
          '+ Read Messages (or Read Channels)',
          '+ Send Messages',
          '+ Use External Emojis',
          '\n- To enable Moderator System',
          '+ Ban Members',
          '+ Kick Members',
          '+ Manage Channels',
          '+ Manage Nickname',
          '+ Read Message History',
          '```',
          'Set Server Prefix: `@Eros prefix <prefix>`',
          'Set Twitter feed channel: `@Eros twitterchannel <mention channel>`',
          'Set Countdown channel: `@Eros cdchannel <mention channel>`',
          'Set hareminfo-allowed channel: `@Eros nsfwchannel <mention channel>`',
          'Set NSFW role: `@Eros nsfwrole <mention role>`',
          'Disable/Enable loli contents (hareminfo): `@Eros loli`',
        ]
      },
      {
        name: 'Getting Familiar With the Commands',
        value: 'Please refer to [Web Documentation](https://docs.thegzm.space/eros-bot) or to `guide` command\'s pages 4 and above.'
      },
    ]
  },
  // Page 4
  {
    contributors: [ 'Euni' ],
    title: 'Commands',
    description: [
      '`help [command]` will display technical information and `guide` command will display newbie-friendly details of the command specified.',
      'Make sure you gather information for that command on both `help` and `guide` commands!',
      `\nStill not clear enough? Submit an issue [**here**](${bugs.url})`,
    ],
    fields: [
      {
        name: 'Critical Tip',
        value: [
          'Texts that are enclosed with `[]` or `<>` meant they are placeholders.',
          'You use it as **`@Eros info eros -tw`**, not as **`@Eros info <item name> <flags>`**!',
        ]
      },
    ]
  },
  // Page 5
  {
    contributors: [ 'Euni' ],
    command: 'info',
    description: [
      'Min. requirement for input length is 2.',
      'If there are multiple results, you will be prompted to select what exactly you would like to see.',
    ],
    fields: [
      {
        name: 'Flags: Options For Narrowing Down Your Search',
        value: [
          '__Each flag is not compatible with *any other flag within this flag type*.__',
          '`-ts`, `--type=soul` souls pool only',
          '`-te`, `--type=eidolon` eidolons pool only',
          '`-tk`, `--type=kamihime` kamihime pool only',
          '`-tw`, `--type-weapon` weapons pool only',
          '\n❯ Example',
          '`@Eros info masamune -ts` — search within souls pool only',
          '`@Eros info ea -tw` — search within weapons pool only',
        ]
      },
      {
        name: 'Flags: Options For Requesting Other Info',
        value: [
          '__Each flag is compatible with *any other flag*.__',
          '`-r`, `--release`, `--releases`, `--releaseweapon` **only for kamihime/weapon**— requests Kamihime\'s weapon / Kamihime Release instead',
          '`-p`, `--preview` requests to show the item\'s image',
          '\n❯ Example',
          '`@Eros info hell staff -tw -r` — request for the kamihime instead',
          '`@Eros info ea -tk -r` — request for the weapon instead',
        ]
      },
      {
        name: 'Emoji Reacts To Interact',
        value: [
          ':frame_photo: — Toggle image',
          ':arrows_counterclockwise: — **only for kamihime/weapon**— See Kamihime / Weapon',
        ]
      },
    ]
  },
  // Page 6
  {
    contributors: [ 'Euni' ],
    command: 'hareminfo',
    description: [
      'Min. requirement for input length is 2.',
      'If there are multiple result, you will be prompted to select what exactly you would like to see.',
    ],
    fields: [
      {
        name: 'Using This Command Normally (Server Manager only)',
        value: [
          '`@Eros nsfwchannel` must be set or I will decline your request.',
          '`@Eros nsfwrole` must be set if you would like me to assign NSFW role to gain access to the NSFW channel.',
          '`@Eros loli` is optional if you hate embedding loli contents from the game. Toggle-able command.',
        ]
      },
      {
        name: 'Using This Command Normally (everyone)',
        value: [
          '`@Eros nsfw` (can be used by everyone) to request access to NSFW Channel and I will assign a role to you. This is only available if the `nsfwrole` is set.',
        ]
      },
    ]
  },
  // Page 7
  {
    contributors: [ 'Euni' ],
    command: 'list',
    description: [
      `__Results are only from [**Kamihime Database**](${url.root}).__`,
      'Required variables can be seen via `@Eros list variables`.',
      'Variables can be combined, but variables will always start with __Primary Variables__ such as:',
      '\t`kamihime`, `eidolon`, `soul`',
      '\n❯ Example',
      '`@Eros filter kamihime ssr fire`',
    ]
  },
  // Page 8
  {
    title: 'Guide End',
    description: [
      'That\'s all for now.',
      `Anything missing or wrong? Submit an issue or a pull request [**here**](${bugs.url})`,
    ],
    fields: [
      {
        name: 'Contacts',
        value: [
          `[**Nutaku Wiki Discord** (further gameplay questions)](${wikiDiscord})`,
          `[**Github Issue Tracker** (bot-related only)](${bugs.url})`,
        ]
      },
    ]
  },
];
