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
        '`@Eros nsfw` to request access to NSFW Channel and I will assign a role to you. This is only available if the `nsfwrole` is set.',
      ]
    },
  ]
} as IDialog;
