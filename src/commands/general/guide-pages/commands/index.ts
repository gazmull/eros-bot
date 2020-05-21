// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { bugs } from '../../../../../package.json';
import countdown from './countdown';
import fun from './fun';
import general from './general';
import kamihime from './kamihime';
import level from './level';
import set from './set';
import tag from './tag';
import util from './util';

/* eslint-disable max-len */

export default [
  {
    contributors: [ 'Euni' ],
    title: 'Commands',
    description: [
      '`help <command name>` will display information about a command.',
      `\nStill not clear enough? Submit an issue [**here**](${bugs.url})`,
    ],
    fields: [
      {
        name: 'Critical Tip',
        value: [
          'Texts that are enclosed with `[]` or `<>` meant they are placeholders.',
          'You use it as **`@Eros info eros -tw`**, not as **`@Eros info <item name> [flags]`**!',
          '\n`[]` means __optional__ | `<>` means __required__',
          '---',
          'Some commands that has multiple arguments can take an argument that has spaces, only if the argument is surrounded by double quotes.',
          'Example: **`@Eros tag edit "am i joke to you" i think so`**',
          'Where `"am i joke to you"` is the tag name while `i think so` is the tag content.',
        ]
      },
    ]
  },
  ...set,
  ...general,
  ...kamihime,
  ...countdown,
  ...tag,
  ...fun,
  ...level,
  ...util,
] as IDialog[];
