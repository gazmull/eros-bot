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
} as IDialog;
