import IErosClientOptions from '../../../../../../../typings/auth';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { url }: { url: IErosClientOptions['url'] } = require('../../../../../../../auth');

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
