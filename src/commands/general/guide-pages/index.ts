// @ts-ignore
import { bugs } from '../../../../package.json';
import commands from './commands';

const wikiDiscord = 'https://discord.gg/jFzQsEs';

/* tslint:disable:max-line-length */

/**
 * Similar to MessageEmbed. If you have contributed to this section, please add your username
 * in `contributors` property (while maintaining alphabetical order).
 * @see [MessageEmbed](https://discord.js.org/#/docs/main/master/class/MessageEmbed)
 */
export default [
  // Page 2
  {
    contributors: [ 'Euni', 'J-Star' ],
    title: 'Guide Start',
    description: 'Are you familiar with the game? No? These links may help you... but maybe for the last section...',
    fields: [
      {
        name: 'Kamihime Project Wiki',
        value: `[DMM Wiki](https://goo.gl/xPVW9t) | [Nutaku Fandom](https://kamihime-project.fandom.com) ([Discord](${wikiDiscord}))`,
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
          '```',
          'Set Server Prefix: `@Eros set prefix <prefix>`',
          'Set Twitter feed channel: `@Eros set twitterchannel <channel>`',
          'Set Countdown channel: `@Eros set cdchannel <channel>`',
          'Set Countdown Subscriber role: `@Eros set cdrole <role>`',
          'Set hareminfo-allowed channel: `@Eros set nsfwchannel <channel>`',
          'Set NSFW role: `@Eros set nsfwrole <role>`',
          'Disable/Enable loli contents (hareminfo): `@Eros set loli`',
          'To view your server\'s current settings: `@Eros settings`',
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
    title: 'Leveling System',
    description: 'Enjoy your stay in the server for gaining EXPs and titles by participating in LS-featured commands, and communicating with fellow server members!',
    fields: [
      {
        name: 'Current LS-featured Commands',
        value: [
          '`quiz`',
        ]
      },
      {
        name: 'How It Works',
        value: [
          'Commenting in a server channel will grant you up to 10 EXP while using LS-featured commands will grant you up to 1000 EXP.',
          'If an LS-featured command is triggered by a user with __Manage Server__ permission, the EXP reward will increase by 500 points.',
          'If you want to know your current level, see `@Eros level` ',
        ]
      },
      {
        name: 'What are Those Unique Titles?',
        value: [
          'They are sort of achievements on how long you have stayed in that server.',
          'The highest title can be achieved at 1.000.000 EXP. Later versions may include titles with more than a million EXP requirment.',
        ]
      },
    ]
  },
  // Page 5+
  ...commands,
  // Last Page
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
          `[**Nutaku Fandom Discord** (further gameplay questions)](${wikiDiscord})`,
          `[**Github Issue Tracker** (bot-related only)](${bugs.url})`,
        ]
      },
    ]
  },
] as IDialog[];