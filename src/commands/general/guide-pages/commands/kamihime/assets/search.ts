import IErosClientOptions from '../../../../../../../typings/auth';

// tslint:disable-next-line:no-var-requires
const { url }: { url: IErosClientOptions['url'] } = require('../../../../../../../auth');

/* tslint:disable:max-line-length */

export default {
  contributors: [ 'Euni' ],
  command: 'search',
  fields: [
    {
      name: 'Warning',
      value: `Results are only from [Kamhime Database](${url.root}).`
    },
  ]
} as IDialog;
