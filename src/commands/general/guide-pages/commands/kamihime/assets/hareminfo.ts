/* tslint:disable:max-line-length */

export default {
  contributors: [ 'Euni' ],
  command: 'hareminfo',
  description: [
    'Min. requirement for input length is 2.',
    'If there are multiple result, you will be prompted to select what exactly you would like to see.',
  ],
  fields: [
    {
      name: 'Disclaimer',
      value: [
        'While this command displays a bunch of links to [Kamihime Database](https://kamihimedb.thegzm.space), they are indeed NSFW links and is against Discord Guidelines if shared on non-NSFW channels.',
        'If you want to use this without setting up the nsfwchannel, either DM the bot (e.g: `hareminfo arthur`) or use the site directly.',
      ]
    },
    {
      name: 'Using This Command Normally (Server Manager only)',
      value: [
        '`@Eros set nsfwchannel` must be set or I will decline your request.',
        '`@Eros set nsfwrole` must be set if you would like me to assign NSFW role to gain access to the NSFW channel.',
      ]
    },
    {
      name: 'Using This Command Normally (everyone)',
      value: [
        '`@Eros nsfw` to request access to NSFW Channel and I will assign a role to you. This is only available if the `nsfwrole` is set.',
      ]
    },
    {
      name: 'Flags: Options For Narrowing Down Your Search',
      value: [
        '`-a`, `--accurate` tells the bot that the name is accurate to immediately acquire the character you desire',
      ]
    },
  ]
} as IDialog;
