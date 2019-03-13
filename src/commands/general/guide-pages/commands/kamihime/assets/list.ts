import IErosClientOptions from '../../../../../../../typings/auth';

// tslint:disable-next-line:no-var-requires
const { url }: { url: IErosClientOptions['url'] } = require('../../../../../../../auth');

export default {
  contributors: [ 'Euni' ],
  command: 'list',
  description: [
    `__Results are only from [**Kamihime Database**](${url.root}).__`,
    'Required variables can be seen via `@Eros list variables`.',
    'Variables can be combined, but variables will always start with __Primary Variables__ such as:',
    '\t`kamihime`, `eidolon`, `soul`',
  ]
} as IDialog;
