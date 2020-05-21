import { readdirSync } from 'fs';

const currentDir = `${__dirname }/assets/`;

const dialog: IDialog = { category: 'util' };

export default [ dialog ].concat(
  readdirSync(currentDir)
    .filter(el => el)
    .map(el => require(currentDir + el).default)
)as IDialog[];
