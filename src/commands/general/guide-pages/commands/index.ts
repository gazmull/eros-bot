// @ts-ignore
import { bugs } from '../../../../../package.json';
import admin from './admin';
import countdown from './countdown';
import fun from './fun';
import general from './general';
import kamihime from './kamihime';
import tag from './tag';
import util from './util';

/* tslint:disable:max-line-length */

export default [
  {
    contributors: [ 'Euni' ],
    title: 'Commands',
    description: [
      '`help [command]` will display brief information and `guide` command will display newbie-friendly information of the command specified.',
      'Make sure you gather information for that command on both `help` and `guide` commands!',
      `\nStill not clear enough? Submit an issue [**here**](${bugs.url})`,
    ],
    fields: [
      {
        name: 'Critical Tip',
        value: [
          'Texts that are enclosed with `[]` or `<>` meant they are placeholders.',
          'You use it as **`@Eros info eros -tw`**, not as **`@Eros info <item name> [flags]`**!',
          '\n`[]` means __optional__ | `<>` means __required__',
        ]
      },
    ]
  },
  ...admin,
  ...general,
  ...kamihime,
  ...countdown,
  ...tag,
  ...fun,
  ...util,
] as IDialog[];
