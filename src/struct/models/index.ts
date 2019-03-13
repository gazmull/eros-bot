import { ISequelizeConfig, Sequelize } from 'sequelize-typescript';
import IErosClientOptions from '../../../typings/auth';
import { Guild } from './factories/Guild';
import { Level } from './factories/Level';
import { Storage } from './factories/Storage';
import { Tag } from './factories/Tag';
import { Title } from './factories/Title';

// tslint:disable-next-line:no-var-requires
const { db }: { db: IErosClientOptions['db'] } = require('../../../auth');

export const sequelize = new Sequelize({
  database: db.database,
  host: db.host,
  username: db.username,
  password: db.password,
  dialect: 'mariadb',
  define: {
    freezeTableName: true,
    charset: 'utf8',
    collate: 'utf8_unicode_ci',
    timestamps: true
  },
  logging: false,
  modelPaths: [ __dirname + '/factories' ],
  operatorAliases: false,
  pool: {
    acquire: 30e3,
    max: 10,
    min: 0
  }
} as ISequelizeConfig);

export const create = () => {
  return {
    sequelize,
    Op: Sequelize.Op,
    Guild,
    Level,
    Storage,
    Tag,
    Title
  };
};
