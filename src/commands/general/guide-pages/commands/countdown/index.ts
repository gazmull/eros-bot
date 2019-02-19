import { readdirSync } from 'fs-extra';

const currentDir = __dirname + '/assets/';

const dialog: IDialog = {
  category: 'countdown'
};

export default [ dialog ].concat(
  readdirSync(currentDir)
    .filter(el => el)!
    .map(el => require(currentDir + el).default)
)as IDialog[];
