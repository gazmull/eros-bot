/* tslint:disable:max-line-length */

export default {
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
        '`-a`, `--accurate` tells the bot that the name is accurate to immediately acquire the character you desire',
        '\u200b',
        '__Each flag is not compatible with *any other flag within this flag type*.__',
        '`-ts`, `--type=soul` souls pool only',
        '`-te`, `--type=eidolon` eidolons pool only',
        '`-tk`, `--type=kamihime` kamihime pool only',
        '`-tw`, `--type=weapon` weapons pool only',
      ]
    },
    {
      name: 'Flags: Options For Requesting Other Info',
      value: [
        '__Each flag is compatible with *any other flag*.__',
        '`-r`, `--release`, `--releases`, `--releaseweapon` **only for kamihime/weapon**— requests Kamihime\'s weapon / Kamihime Release instead',
        '`-p`, `--preview` requests to show the item\'s image',
        '\u200b',
        '__Each flag is only compatible with Souls__',
        '`-m`, `--mex` requests character\'s Master Extra Abilities',
      ]
    },
    {
      name: 'Emoji Reacts To Interact',
      value: [
        '🖼 — Toggle image',
        '🔄 — **only for kamihime/weapon/soul**— See Kamihime / Weapon / Soul\'s Master Extra Abilities',
      ]
    },
  ]
} as IDialog;
